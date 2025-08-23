import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OwareBoard } from './OwareBoard';
import { useOwareGame } from '@/hooks/useOwareGame';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

interface OwareGameInterfaceProps {
  gameMode: 'single-player' | 'multiplayer';
  rules?: 'anan-anan' | 'abapa';
  onBack: () => void;
}

export const OwareGameInterface = ({ gameMode, rules = 'anan-anan', onBack }: OwareGameInterfaceProps) => {
  const { gameState, selectedPit, setSelectedPit, makeMove, startGame, resetGame } = useOwareGame(gameMode, rules);
  const [isPaused, setIsPaused] = useState(false);

  const handlePitClick = (pitIndex: number) => {
    if (gameState.gameStatus === 'playing' && !isPaused && !gameState.isThinking) {
      makeMove(pitIndex);
    }
  };

  if (gameState.gameStatus === 'finished') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gameState.winner ? (
              <div>
                <p className="text-lg font-semibold text-primary">
                  Player {gameState.winner} Wins!
                </p>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{gameState.board.playerOneScore}</p>
                    <p className="text-sm text-muted-foreground">Player 1</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{gameState.board.playerTwoScore}</p>
                    <p className="text-sm text-muted-foreground">Player 2</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-lg">It's a tie!</p>
            )}
            
            <div className="flex justify-center gap-4">
              <Button onClick={resetGame} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {gameMode === 'single-player' ? 'vs AI' : 'Multiplayer'} Oware ({rules === 'anan-anan' ? 'Anan-Anan' : 'Abapa'})
          </h1>
          {gameState.isThinking && (
            <p className="text-sm text-muted-foreground mt-1">AI is thinking...</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {gameState.gameStatus === 'playing' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Status */}
      {gameState.gameStatus === 'waiting' && (
        <div className="text-center mb-6">
          <Card>
            <CardContent className="py-6">
              <p className="text-lg mb-4">Ready to play Oware?</p>
              <Button onClick={() => {
                console.log('Start Game button clicked!');
                startGame();
              }}>Start Game</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && gameState.gameStatus === 'playing' && (
        <div className="text-center mb-6">
          <Card>
            <CardContent className="py-6">
              <p className="text-lg mb-4">Game Paused</p>
              <Button onClick={() => setIsPaused(false)}>Resume</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Board */}
      <OwareBoard
        board={gameState.board}
        currentPlayer={gameState.currentPlayer}
        onPitClick={handlePitClick}
        selectedPit={selectedPit}
        isGameActive={gameState.gameStatus === 'playing' && !isPaused}
      />

      {/* Game Rules Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Rules:</strong> {rules === 'anan-anan' ? 'Anan-Anan (Four-Four)' : 'Abapa'}</p>
          <p>• <strong>Objective:</strong> Capture more stones than your opponent</p>
          <p>• <strong>Your Turn:</strong> Click one of your pits (bottom row) to sow stones</p>
          <p>• <strong>Sowing:</strong> Stones are distributed counter-clockwise, one per pit</p>
          {rules === 'anan-anan' ? (
            <>
              <p>• <strong>Capture:</strong> When any pit reaches 4 stones during distribution, they are captured!</p>
              <p>• <strong>Continue:</strong> Pick up from last pit and keep sowing until reaching an empty pit</p>
              <p>• <strong>End Game:</strong> When 8 stones remain, last capturer takes all remaining stones</p>
            </>
          ) : (
            <>
              <p>• <strong>Capture:</strong> When last stone lands in opponent's pit with 2-3 stones, capture working backwards</p>
              <p>• <strong>End Game:</strong> First player to capture more than 24 stones wins</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};