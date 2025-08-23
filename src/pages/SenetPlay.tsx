import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SenetBoard } from '@/components/senet/SenetBoard';
import { ThrowingSticks } from '@/components/senet/ThrowingSticks';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { useSenetGame } from '@/hooks/useSenetGame';
import { useSenetAI } from '@/hooks/useSenetAI';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

export default function SenetPlay() {
  usePageTitle('Playing Ancient Senet');
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'medium';
  
  const {
    gameState,
    isProcessing,
    throwSticks,
    makeMove,
    resetGame,
    setAIDifficulty
  } = useSenetGame();

  const { isThinking } = useSenetAI(gameState, makeMove, throwSticks);

  useEffect(() => {
    setAIDifficulty(difficulty);
  }, [difficulty, setAIDifficulty]);

  const handleSquareClick = (position: number) => {
    if (gameState.gamePhase === 'moving' && gameState.availableMoves.includes(position)) {
      const piece = gameState.board[position];
      if (piece && piece.player === gameState.currentPlayer && !gameState.players.find(p => p.id === gameState.currentPlayer)?.isAI) {
        makeMove(position);
      }
    }
  };

  const handleThrowSticks = () => {
    if (gameState.gamePhase === 'throwing' && !gameState.players.find(p => p.id === gameState.currentPlayer)?.isAI) {
      return throwSticks();
    }
    return null;
  };

  const currentPlayerInfo = gameState.players.find(p => p.id === gameState.currentPlayer);
  const playerPieces = gameState.board.filter(p => p?.player === 1).length;
  const aiPieces = gameState.board.filter(p => p?.player === 2).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/senet')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
            <div className="text-2xl">𓋹</div>
            <h1 className="text-xl font-bold text-foreground">Ancient Senet</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetGame}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Game
            </Button>
            <FullscreenToggle />
          </div>
        </div>

        {/* Game Status */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Current Player */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Turn</div>
                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full",
                    currentPlayerInfo?.id === 1
                      ? "bg-gradient-to-br from-amber-400 to-amber-600"
                      : "bg-gradient-to-br from-slate-400 to-slate-600"
                  )} />
                  <span className="font-semibold">
                    {currentPlayerInfo?.name}
                    {isThinking && " (thinking...)"}
                  </span>
                  {currentPlayerInfo?.isAI && (
                    <Badge variant="outline" className="text-xs">
                      {currentPlayerInfo.difficulty}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Game Phase */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Phase</div>
                <Badge variant="secondary">
                  {gameState.gamePhase === 'throwing' && 'Throwing Sticks'}
                  {gameState.gamePhase === 'moving' && 'Moving Pieces'}
                  {gameState.gamePhase === 'finished' && 'Game Complete'}
                </Badge>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Pieces Remaining</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                    <span className="font-semibold">{playerPieces}</span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-slate-600" />
                    <span className="font-semibold">{aiPieces}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Winner */}
        {gameState.winner && (
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-100 to-orange-200 dark:from-amber-950/50 dark:to-orange-950/50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-2">
                {gameState.winner === 1 ? '𓋹' : '𓀁'}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {gameState.winner === 1 ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {gameState.winner === 1 
                  ? 'You have successfully journeyed to the afterlife!'
                  : 'The AI opponent has reached the afterlife first.'}
              </p>
              <Button onClick={resetGame} className="bg-amber-600 hover:bg-amber-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board */}
          <div className="lg:col-span-3">
            <SenetBoard 
              gameState={gameState} 
              onSquareClick={handleSquareClick}
            />
          </div>

          {/* Game Controls */}
          <div className="space-y-4">
            
            {/* Throwing Sticks */}
            <ThrowingSticks
              onThrow={handleThrowSticks}
              lastResult={gameState.lastRoll > 0 ? {
                sticks: [true, true, true, true].slice(0, gameState.lastRoll === 6 ? 0 : gameState.lastRoll),
                value: gameState.lastRoll
              } : undefined}
              disabled={gameState.gamePhase !== 'throwing' || !!currentPlayerInfo?.isAI || !!gameState.winner || isProcessing}
              currentPlayer={gameState.currentPlayer}
            />

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>1. Throw Sticks</strong>
                  <p className="text-muted-foreground">Cast the sacred sticks to determine movement</p>
                </div>
                <Separator />
                <div>
                  <strong>2. Move Pieces</strong>
                  <p className="text-muted-foreground">Click highlighted pieces to move them</p>
                </div>
                <Separator />
                <div>
                  <strong>3. Capture & Block</strong>
                  <p className="text-muted-foreground">Land on opponents to send them back</p>
                </div>
                <Separator />
                <div>
                  <strong>4. Reach Afterlife</strong>
                  <p className="text-muted-foreground">Get all pieces off the board to win</p>
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>𓈖</span>
                  Game Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Moves Made:</span>
                  <span className="font-semibold">{gameState.moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Difficulty:</span>
                  <Badge variant="outline" className="text-xs">
                    {difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Game Duration:</span>
                  <span className="font-semibold">
                    {Math.floor((gameState.updatedAt.getTime() - gameState.createdAt.getTime()) / 60000)}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}