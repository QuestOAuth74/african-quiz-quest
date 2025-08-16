import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWheelGameState } from '@/hooks/useWheelGameState';
import { WheelComponent } from '@/components/wheel/WheelComponent';
import { PuzzleBoard } from '@/components/wheel/PuzzleBoard';
import { GuessInput } from '@/components/wheel/GuessInput';
import { PlayerScoreboard } from '@/components/wheel/PlayerScoreboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WheelPlay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    gameSession,
    gameState,
    loading,
    createGameSession,
    spinWheel,
    guessLetter,
    buyVowel,
    solvePuzzle
  } = useWheelGameState();

  const { player1Id, player2Email } = location.state || {};

  useEffect(() => {
    if (!user || !player1Id || !player2Email) {
      navigate('/wheel');
      return;
    }

    // For demo purposes, we'll create a mock second player
    // In a real implementation, you'd look up the player by email
    const mockPlayer2Id = 'mock-player-2-id';
    createGameSession(mockPlayer2Id);
  }, [user, player1Id, player2Email, navigate, createGameSession]);

  const handleSpin = (value: number | string) => {
    spinWheel(value);
  };

  const isCurrentPlayerTurn = () => {
    return gameSession && gameSession.current_player === 1; // Assuming user is always player 1
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Setting up your game...</p>
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
            Back to Game Setup
          </Button>
        </div>
      </div>
    );
  }

  const player1 = {
    id: gameSession.player1_id,
    name: 'Player 1',
    totalScore: gameSession.player1_score,
    roundScore: gameSession.player1_round_score,
    roundsWon: gameSession.rounds_won_player1
  };

  const player2 = {
    id: gameSession.player2_id,
    name: 'Player 2',
    totalScore: gameSession.player2_score,
    roundScore: gameSession.player2_round_score,
    roundsWon: gameSession.rounds_won_player2
  };

  const currentPlayerScore = gameSession.current_player === 1 
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
            <span>Back to Setup</span>
          </Button>
          
          <h1 className="text-2xl font-bold text-primary">Wheel of African Destiny</h1>
          <div></div> {/* Spacer for centering */}
        </div>

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
              onGuessLetter={guessLetter}
              onBuyVowel={buyVowel}
              onSolvePuzzle={solvePuzzle}
              guessedLetters={gameState.guessedLetters}
              currentPlayerScore={currentPlayerScore}
              disabled={!isCurrentPlayerTurn() || gameState.gamePhase !== 'guessing'}
              wheelValue={gameState.wheelValue}
            />
          </div>
        </div>

        {/* Game Status Messages */}
        {!isCurrentPlayerTurn() && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-muted p-4 rounded-lg shadow-lg">
            <p className="text-center font-semibold">
              Waiting for {gameSession.current_player === 1 ? 'Player 1' : 'Player 2'}'s turn...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WheelPlay;