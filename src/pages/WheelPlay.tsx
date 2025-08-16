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
import { WheelGameCompletionModal } from '@/components/wheel/WheelGameCompletionModal';
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

  const switchTurn = async () => {
    if (!gameSession) return;

    const newPlayer = gameSession.current_player === 1 ? 2 : 1;
    const newGameState = {
      revealedLetters: gameState.revealedLetters,
      guessedLetters: gameState.guessedLetters,
      wheelValue: 0,
      isSpinning: false,
      currentPlayerTurn: newPlayer,
      gamePhase: 'spinning' as const
    };
    
    const updatedSession = { 
      ...gameSession, 
      current_player: newPlayer,
      game_state: newGameState
    };
    
    await supabase
      .from('wheel_game_sessions')
      .update(updatedSession)
      .eq('id', gameSession.id);
    
    setGameSession(updatedSession);
    setGameState(prev => ({
      ...prev,
      currentPlayerTurn: newPlayer,
      gamePhase: 'spinning',
      wheelValue: 0
    }));
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

      const newGameState = {
        revealedLetters: gameState.revealedLetters,
        guessedLetters: gameState.guessedLetters,
        wheelValue: value,
        isSpinning: false,
        currentPlayerTurn: gameState.currentPlayerTurn,
        gamePhase: value === 'BANKRUPT' || value === 'LOSE_TURN' ? 'spinning' : 'guessing'
      };

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
        
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 0,
          current_player: gameSession.current_player === 1 ? 2 : 1,
          game_state: newGameState
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        await switchTurn();
      } else if (value === 'LOSE_TURN') {
        toast({
          title: "Lose a Turn!",
          description: "Your turn is over!",
          variant: "destructive"
        });
        await switchTurn();
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
        
        // Update the new game state without currentPuzzle (it's stored separately)
        const newGameState = {
          revealedLetters: newRevealedLetters,
          guessedLetters: newGuessedLetters,
          wheelValue: gameState.wheelValue,
          isSpinning: false,
          currentPlayerTurn: gameState.currentPlayerTurn,
          gamePhase: 'spinning' as const // Player gets to spin again
        };
        
        // Update scores and game state in database
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 
            (gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score) + pointsEarned,
          game_state: newGameState
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
          gamePhase: 'spinning'
        }));
        
        toast({
          title: "Correct!",
          description: `Good guess! You earned ${pointsEarned} points.`,
        });
      } else {
        // Letter is wrong - update game state and switch turns
        const newGameState = {
          revealedLetters: gameState.revealedLetters,
          guessedLetters: newGuessedLetters,
          wheelValue: gameState.wheelValue,
          isSpinning: false,
          currentPlayerTurn: gameState.currentPlayerTurn,
          gamePhase: gameState.gamePhase
        };
        
        // Update game state in database
        const updatedSession = {
          ...gameSession,
          game_state: newGameState
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
        
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
      const VOWEL_COST = 250;
      const isPlayer1Turn = gameSession.current_player === 1;
      const roundScoreKey = isPlayer1Turn ? 'player1_round_score' : 'player2_round_score';
      const currentRoundScore: number = (gameSession as any)[roundScoreKey] || 0;

      if (currentRoundScore < VOWEL_COST) {
        toast({
          title: 'Not enough points',
          description: `You need $${VOWEL_COST} to buy a vowel.`,
          variant: 'destructive'
        });
        return;
      }

      const upperVowel = vowel.toUpperCase();
      if (!'AEIOU'.includes(upperVowel)) return;
      if (gameState.guessedLetters.includes(upperVowel)) return;

      const phrase = gameState.currentPuzzle?.phrase.toUpperCase() || '';
      const isCorrect = phrase.includes(upperVowel);

      // Log the move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'buy_vowel',
          move_data: { vowel: upperVowel, correct: isCorrect, cost: VOWEL_COST },
          points_earned: 0
        });

      const newGuessedLetters = Array.from(new Set([...gameState.guessedLetters, upperVowel]));
      const newRevealedLetters = isCorrect
        ? Array.from(new Set([...gameState.revealedLetters, upperVowel]))
        : gameState.revealedLetters;

      const newRoundScore = currentRoundScore - VOWEL_COST;

      const newGameState = {
        revealedLetters: newRevealedLetters,
        guessedLetters: newGuessedLetters,
        wheelValue: gameState.wheelValue,
        isSpinning: false,
        currentPlayerTurn: gameState.currentPlayerTurn,
        gamePhase: isCorrect ? 'guessing' as const : gameState.gamePhase
      };

      const updatedSession = {
        ...gameSession,
        [roundScoreKey]: newRoundScore,
        game_state: newGameState
      } as typeof gameSession;

      await supabase
        .from('wheel_game_sessions')
        .update(updatedSession as any)
        .eq('id', gameSession.id);

      setGameSession(updatedSession);
      setGameState(prev => ({
        ...prev,
        revealedLetters: newRevealedLetters,
        guessedLetters: newGuessedLetters,
      }));

      if (isCorrect) {
        toast({
          title: 'Vowel revealed!',
          description: `${upperVowel} is in the puzzle. You can buy another vowel or solve.`,
        });
      } else {
        toast({
          title: 'Incorrect vowel',
          description: `${upperVowel} is not in the puzzle. Turn passes.`,
          variant: 'destructive'
        });
        await switchTurn();
      }
    } catch (error) {
      console.error('Error buying vowel:', error);
      toast({
        title: 'Error',
        description: 'Failed to buy vowel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSolvePuzzle = async (solution: string) => {
    if (!gameSession || !user) return;

    try {
      const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');
      const target = normalize(gameState.currentPuzzle?.phrase || '');
      const guess = normalize(solution);
      const isCorrect = target.length > 0 && guess === target;

      // Log the move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'solve_puzzle',
          move_data: { solution: solution.toUpperCase(), correct: isCorrect },
          points_earned: 0
        });

      if (isCorrect) {
        // Reveal all letters
        const allLetters = Array.from(new Set((gameState.currentPuzzle?.phrase || '')
          .toUpperCase()
          .replace(/[^A-Z]/g, '')
          .split('')));
        const newRevealed = Array.from(new Set([...gameState.revealedLetters, ...allLetters]));
        const newGuessed = Array.from(new Set([...gameState.guessedLetters, ...allLetters]));

        const isPlayer1Turn = gameSession.current_player === 1;
        const roundScoreKey = isPlayer1Turn ? 'player1_round_score' : 'player2_round_score';
        const totalScoreKey = isPlayer1Turn ? 'player1_score' : 'player2_score';
        const roundsWonKey = isPlayer1Turn ? 'rounds_won_player1' : 'rounds_won_player2';

        const roundScore: number = (gameSession as any)[roundScoreKey] || 0;
        const newTotal = ((gameSession as any)[totalScoreKey] || 0) + roundScore;
        const newRoundsWon = ((gameSession as any)[roundsWonKey] || 0) + 1;

        const newGameState = {
          revealedLetters: newRevealed,
          guessedLetters: newGuessed,
          wheelValue: gameState.wheelValue,
          isSpinning: false,
          currentPlayerTurn: gameState.currentPlayerTurn,
          gamePhase: 'round_end' as const,
          puzzleSolved: true
        };

        const updatedSession = {
          ...gameSession,
          [totalScoreKey]: newTotal,
          [roundsWonKey]: newRoundsWon,
          player1_round_score: 0,
          player2_round_score: 0,
          status: 'round_complete',
          game_state: newGameState
        } as typeof gameSession;

        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession as any)
          .eq('id', gameSession.id);

        setGameSession(updatedSession);
        setGameState(prev => ({
          ...prev,
          revealedLetters: newRevealed,
          guessedLetters: newGuessed,
          gamePhase: 'round_end'
        }));

        toast({
          title: 'Correct! Puzzle solved!',
          description: 'Round complete. Returning to lobby...',
        });
      } else {
        toast({
          title: 'Incorrect solution',
          description: 'That solution is not correct. Turn passes.',
          variant: 'destructive'
        });
        await switchTurn();
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit solution. Please try again.',
        variant: 'destructive'
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

  // Check if game is completed
  const isGameCompleted = gameSession.status === 'round_complete' && gameState.gamePhase === 'round_end';
  const winner = gameSession.current_player === 1 ? player1 : player2;
  const winnerScore = gameSession.current_player === 1 ? gameSession.player1_score : gameSession.player2_score;

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

        {/* Always show full game layout */}
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
            
            <div className="flex flex-col items-center space-y-4">
              {gameState.gamePhase === 'spinning' && gameState.revealedLetters.length === 0 && (
                <p className="text-center text-lg font-semibold text-primary animate-pulse">
                  Spin to start! Category: {gameState.currentPuzzle.category.toUpperCase()}
                </p>
              )}
              
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

        {/* Game Status Messages */}
        {!isCurrentPlayerTurn() && !isGameCompleted && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-muted p-4 rounded-lg shadow-lg">
            <p className="text-center font-semibold">
              Waiting for {gameSession.current_player === 1 ? player1.name : player2.name}'s turn...
            </p>
          </div>
        )}

        {/* Computer thinking indicator */}
        {gameSession?.game_mode === 'single' && gameSession.current_player === 2 && computerPlayer.isThinking && !isGameCompleted && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
            <p className="text-center font-semibold flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>{player2.name} is thinking...</span>
            </p>
          </div>
        )}

        {/* Game Completion Modal */}
        <WheelGameCompletionModal
          isOpen={isGameCompleted}
          winnerName={winner.name}
          winnerScore={winnerScore}
          puzzle={gameState.currentPuzzle?.phrase || ''}
          category={gameState.currentPuzzle?.category || ''}
          onReturnToLobby={() => navigate('/wheel')}
        />
      </div>
    </div>
  );
};

export default WheelPlay;