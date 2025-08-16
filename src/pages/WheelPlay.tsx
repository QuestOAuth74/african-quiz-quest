import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeGameSync } from '@/hooks/useRealtimeGameSync';
import { useComputerPlayer } from '@/hooks/useComputerPlayer';
import { supabase } from '@/integrations/supabase/client';
import { WheelComponent } from '@/components/wheel/WheelComponent';
import { PuzzleBoard } from '@/components/wheel/PuzzleBoard';
import { GuessInput } from '@/components/wheel/GuessInput';
import { PlayerScoreboard } from '@/components/wheel/PlayerScoreboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Wheel game play component for two-player matches
const WheelPlay = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ sessionId: string }>();
  
  const gameSessionId = params.sessionId || (location.state as any)?.gameSessionId || null;
  
  const {
    gameSession,
    gameState,
    loading,
    setGameState,
    setGameSession
  } = useRealtimeGameSync(gameSessionId);

  useEffect(() => {
    // Wait for auth to resolve before any navigation decisions
    if (authLoading) return;

    // ProtectedRoute will handle redirecting unauthenticated users to /auth
    if (!user) return;

    if (!gameSessionId) {
      console.warn('WheelPlay: Missing gameSessionId, navigating back to /wheel');
      navigate('/wheel', { replace: true });
      return;
    }
  }, [authLoading, user, gameSessionId, navigate]);

  const checkPuzzleCompletion = (revealedLetters: string[]) => {
    if (!gameState.currentPuzzle) return;
    
    // Get all unique letters in the puzzle
    const puzzleLetters = gameState.currentPuzzle.phrase.toUpperCase().match(/[A-Z]/g) || [];
    const uniquePuzzleLetters = [...new Set(puzzleLetters)];
    
    // Check if all letters are revealed
    const allLettersRevealed = uniquePuzzleLetters.every(letter => 
      revealedLetters.includes(letter)
    );
    
    if (allLettersRevealed) {
      // Puzzle is complete! Award bonus and win the round
      setTimeout(() => {
        toast({
          title: "Puzzle Complete!",
          description: "All letters revealed! You can now solve the puzzle for bonus points.",
        });
      }, 1000);
    }
  };

  const switchTurn = async () => {
    if (!gameSession) return;

    const newPlayer = gameSession.current_player === 1 ? 2 : 1;
    
    try {
      await supabase
        .from('wheel_game_sessions')
        .update({ current_player: newPlayer })
        .eq('id', gameSession.id);
      
      const updatedSession = { ...gameSession, current_player: newPlayer };
      setGameSession(updatedSession);
      
      setGameState(prev => ({ 
        ...prev, 
        currentPlayerTurn: newPlayer,
        gamePhase: 'spinning',
        wheelValue: 0
      }));
    } catch (error) {
      console.error('Error switching turns:', error);
    }
  };

  const handleSpin = async (value: number | string) => {
    if (!gameSession || !user) return;

    try {
      // Record the spin move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'spin',
          move_data: { value },
          points_earned: 0
        });

      setGameState(prev => ({
        ...prev,
        wheelValue: value,
        isSpinning: false,
        gamePhase: value === 'BANKRUPT' || value === 'LOSE_TURN' ? 'spinning' : 'guessing'
      }));

      if (value === 'BANKRUPT') {
        toast({
          title: "Bankrupt!",
          description: "You lost all your round points and your turn!",
          variant: "destructive"
        });
        
        // Player loses all round score and switch turns
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 0,
          current_player: gameSession.current_player === 1 ? 2 : 1
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        // Update local state to reflect turn change
        setGameState(prev => ({ 
          ...prev, 
          currentPlayerTurn: updatedSession.current_player,
          gamePhase: 'spinning',
          wheelValue: 0
        }));
      } else if (value === 'LOSE_TURN') {
        toast({
          title: "Lose a Turn!",
          description: "Your turn is over!",
          variant: "destructive"
        });
        
        // Just switch turns without losing points
        const updatedSession = {
          ...gameSession,
          current_player: gameSession.current_player === 1 ? 2 : 1
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        // Update local state to reflect turn change
        setGameState(prev => ({ 
          ...prev, 
          currentPlayerTurn: updatedSession.current_player,
          gamePhase: 'spinning',
          wheelValue: 0
        }));
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
      toast({
        title: "Error spinning wheel",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGuessLetter = async (letter: string) => {
    if (!gameSession || !user) return;

    try {
      // Check if letter is in the puzzle
      const isCorrect = gameState.currentPuzzle?.phrase.toUpperCase().includes(letter.toUpperCase()) || false;
      
      // Record the guess move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'guess_letter',
          move_data: { letter, correct: isCorrect },
          points_earned: isCorrect ? (gameState.wheelValue as number) : 0
        });

      // Update guessed letters
      const newGuessedLetters = [...gameState.guessedLetters, letter.toUpperCase()];
      
      if (isCorrect) {
        // Letter is correct - add to revealed letters and award points
        const newRevealedLetters = [...gameState.revealedLetters, letter.toUpperCase()];
        const letterCount = (gameState.currentPuzzle?.phrase.toUpperCase().match(new RegExp(letter.toUpperCase(), 'g')) || []).length;
        const pointsEarned = (gameState.wheelValue as number) * letterCount;
        
        // Update scores
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 
            (gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score) + pointsEarned
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        setGameState(prev => ({
          ...prev,
          revealedLetters: newRevealedLetters,
          guessedLetters: newGuessedLetters,
          gamePhase: 'spinning' // Player gets to spin again
        }));
        
        toast({
          title: "Correct!",
          description: `Good guess! You earned ${pointsEarned} points.`,
        });
      } else {
        // Letter is wrong - switch turns
        setGameState(prev => ({
          ...prev,
          guessedLetters: newGuessedLetters
        }));
        
        toast({
          title: "Incorrect",
          description: `Sorry, "${letter}" is not in the puzzle.`,
          variant: "destructive"
        });
        
        await switchTurn();
      }
    } catch (error) {
      console.error('Error guessing letter:', error);
      toast({
        title: "Error",
        description: "Failed to process guess. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBuyVowel = async (vowel: string) => {
    if (!gameSession || !user) return;

    try {
      const vowelCost = 250;
      const currentRoundScore = gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score;
      
      // Check if player has enough points
      if (currentRoundScore < vowelCost) {
        toast({
          title: "Not enough points",
          description: `You need $${vowelCost} to buy a vowel. You have $${currentRoundScore}.`,
          variant: "destructive"
        });
        return;
      }

      // Check if vowel is in the puzzle
      const isCorrect = gameState.currentPuzzle?.phrase.toUpperCase().includes(vowel.toUpperCase()) || false;
      
      // Record the vowel purchase move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'buy_vowel',
          move_data: { vowel, correct: isCorrect },
          points_earned: -vowelCost
        });

      // Update guessed letters
      const newGuessedLetters = [...gameState.guessedLetters, vowel.toUpperCase()];
      
      // Deduct vowel cost from round score
      const updatedSession = {
        ...gameSession,
        [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: currentRoundScore - vowelCost
      };
      
      if (isCorrect) {
        // Vowel is in the puzzle - add to revealed letters
        const newRevealedLetters = [...gameState.revealedLetters, vowel.toUpperCase()];
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        setGameState(prev => ({
          ...prev,
          revealedLetters: newRevealedLetters,
          guessedLetters: newGuessedLetters,
          gamePhase: 'spinning' // Player gets to spin again
        }));
        
        toast({
          title: "Good choice!",
          description: `"${vowel}" is in the puzzle! You spent $${vowelCost}.`,
        });
        
        // Check if puzzle is now complete
        checkPuzzleCompletion(newRevealedLetters);
      } else {
        // Vowel is not in the puzzle - switch turns
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        setGameState(prev => ({
          ...prev,
          guessedLetters: newGuessedLetters
        }));
        
        toast({
          title: "Not in puzzle",
          description: `"${vowel}" is not in the puzzle. You spent $${vowelCost}.`,
          variant: "destructive"
        });
        
        await switchTurn();
      }
    } catch (error) {
      console.error('Error buying vowel:', error);
      toast({
        title: "Error",
        description: "Failed to buy vowel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSolvePuzzle = async (solution: string) => {
    if (!gameSession || !user || !gameState.currentPuzzle) return;

    try {
      // Normalize both strings for comparison (remove extra spaces, case insensitive)
      const normalizedSolution = solution.trim().toUpperCase().replace(/\s+/g, ' ');
      const normalizedPuzzle = gameState.currentPuzzle.phrase.trim().toUpperCase().replace(/\s+/g, ' ');
      const isCorrect = normalizedSolution === normalizedPuzzle;
      
      // Record the solve attempt
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'solve_puzzle',
          move_data: { solution, correct: isCorrect },
          points_earned: isCorrect ? (gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score) : 0
        });

      if (isCorrect) {
        // Puzzle solved correctly!
        const currentRoundScore = gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score;
        const bonusPoints = currentRoundScore; // Current round score as bonus
        const newTotalScore = (gameSession.current_player === 1 ? gameSession.player1_score : gameSession.player2_score) + currentRoundScore + bonusPoints;
        const newRoundsWon = (gameSession.current_player === 1 ? gameSession.rounds_won_player1 : gameSession.rounds_won_player2) + 1;
        
        // Update game session with win
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_score' : 'player2_score']: newTotalScore,
          [gameSession.current_player === 1 ? 'rounds_won_player1' : 'rounds_won_player2']: newRoundsWon,
          status: 'completed' as const
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        
        // Reveal all letters in the puzzle
        const allLetters = gameState.currentPuzzle.phrase.toUpperCase().match(/[A-Z]/g) || [];
        const uniqueLetters = [...new Set(allLetters)];
        
        setGameState(prev => ({
          ...prev,
          revealedLetters: uniqueLetters,
          gamePhase: 'round_end' as const
        }));
        
        toast({
          title: "Congratulations!",
          description: `You solved the puzzle! You earned ${currentRoundScore + bonusPoints} points total.`,
          duration: 5000
        });
      } else {
        // Wrong solution - switch turns
        toast({
          title: "Incorrect Solution",
          description: "That's not the correct answer. Your turn is over.",
          variant: "destructive"
        });
        
        await switchTurn();
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isCurrentPlayerTurn = () => {
    if (!gameSession || !user) return false;
    
    // Check if this is a single player game
    const isSinglePlayer = gameSession.game_mode === 'single';
    
    if (isSinglePlayer) {
      // In single player, only allow player 1 (human) to take actions during their turn
      return gameSession.current_player === 1 && gameSession.player1_id === user.id;
    }
    
    // For multiplayer games
    const isPlayer1 = gameSession.player1_id === user.id;
    const isPlayer2 = gameSession.player2_id === user.id;
    
    if (isPlayer1 && gameSession.current_player === 1) return true;
    if (isPlayer2 && gameSession.current_player === 2) return true;
    
    return false;
  };

  // Initialize computer player for single player mode
  const computerPlayer = useComputerPlayer({
    difficulty: (gameSession?.computer_difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    currentPuzzle: gameState.currentPuzzle,
    gameState,
    onSpin: handleSpin,
    onGuessLetter: handleGuessLetter,
    onBuyVowel: handleBuyVowel,
    onSolvePuzzle: handleSolvePuzzle
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameSession || !gameState.currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Failed to load game. Please try again.</p>
          <Button onClick={() => navigate('/wheel')}>
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Determine player names and current user's role
  const isPlayer1 = user && gameSession.player1_id === user.id;
  const isSinglePlayer = gameSession.game_mode === 'single';
  
  const player1 = {
    id: gameSession.player1_id,
    name: isPlayer1 ? 'You' : 'Player 1',
    totalScore: gameSession.player1_score,
    roundScore: gameSession.player1_round_score,
    roundsWon: gameSession.rounds_won_player1
  };

  const player2 = {
    id: gameSession.player2_id || 'computer',
    name: isSinglePlayer 
      ? (gameSession.computer_player_data?.name || 'Computer') 
      : (isPlayer1 ? 'Player 2' : 'You'),
    totalScore: gameSession.player2_score,
    roundScore: gameSession.player2_round_score,
    roundsWon: gameSession.rounds_won_player2
  };

  // Get current player's score based on who the user is
  const currentPlayerScore = isPlayer1 
    ? gameSession.player1_round_score 
    : gameSession.player2_round_score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/wheel')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Lobby</span>
          </Button>
          
          <h1 className="text-2xl font-bold text-primary">Wheel of African Destiny</h1>
          <div></div> {/* Spacer for centering */}
        </div>

        {/* Check if this is the first turn and no letters revealed yet */}
        {gameState.gamePhase === 'spinning' && gameState.revealedLetters.length === 0 ? (
          // Show only the wheel on first turn
          <div className="flex flex-col items-center justify-center space-y-8 min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">Ready to Spin?</h2>
              <p className="text-lg text-muted-foreground">
                Spin the wheel to start playing! Category: <span className="font-semibold text-primary">{gameState.currentPuzzle.category.toUpperCase()}</span>
              </p>
            </div>
            
            <WheelComponent
              onSpin={handleSpin}
              disabled={!isCurrentPlayerTurn()}
              isSpinning={gameState.isSpinning}
            />
            
            {!isCurrentPlayerTurn() && (
              <p className="text-center font-semibold text-muted-foreground">
                Waiting for {gameSession.current_player === 1 ? player1.name : player2.name} to spin...
              </p>
            )}
          </div>
        ) : (
          // Show full game layout after first spin
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Scoreboard */}
            <div className="lg:col-span-1">
              <PlayerScoreboard
                player1={player1}
                player2={player2}
                currentPlayerTurn={gameSession.current_player}
                gameStatus={gameSession.status}
              />
            </div>

            {/* Middle Column: Game Board */}
            <div className="lg:col-span-1 space-y-6">
              <PuzzleBoard
                puzzle={gameState.currentPuzzle}
                revealedLetters={gameState.revealedLetters}
              />
              
              <div className="flex justify-center">
                <WheelComponent
                  onSpin={handleSpin}
                  disabled={!isCurrentPlayerTurn() || gameState.gamePhase !== 'spinning'}
                  isSpinning={gameState.isSpinning}
                />
              </div>
            </div>

            {/* Right Column: Game Controls */}
            <div className="lg:col-span-1">
              <GuessInput
                onGuessLetter={handleGuessLetter}
                onBuyVowel={handleBuyVowel}
                onSolvePuzzle={handleSolvePuzzle}
                guessedLetters={gameState.guessedLetters}
                currentPlayerScore={currentPlayerScore}
                disabled={!isCurrentPlayerTurn() || gameState.gamePhase !== 'guessing'}
                wheelValue={gameState.wheelValue}
              />
            </div>
          </div>
        )}

        {/* Game Status Messages */}
        {!isCurrentPlayerTurn() && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-muted p-4 rounded-lg shadow-lg">
            <p className="text-center font-semibold">
              Waiting for {gameSession.current_player === 1 ? player1.name : player2.name}'s turn...
            </p>
          </div>
        )}

        {/* Computer thinking indicator */}
        {gameSession?.game_mode === 'single' && gameSession.current_player === 2 && computerPlayer.isThinking && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
            <p className="text-center font-semibold flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>{player2.name} is thinking...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WheelPlay;