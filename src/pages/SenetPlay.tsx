import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Music, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { SenetBoard } from '@/components/senet/SenetBoard';
import { ThrowingSticks } from '@/components/senet/ThrowingSticks';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { useSenetGame } from '@/hooks/useSenetGame';
import { useOnlineSenetGame } from '@/hooks/useOnlineSenetGame';
import { useSenetAI } from '@/hooks/useSenetAI';
import { useSenetAudio } from '@/hooks/useSenetAudio';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function SenetPlay() {
  usePageTitle('Playing Ancient Senet');
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'medium';
  const mode = searchParams.get('mode') || 'single';
  const isMultiplayer = mode === 'multiplayer';
  
  // Use different hooks based on game mode
  const singlePlayerGame = useSenetGame();
  const multiplayerGame = useOnlineSenetGame(isMultiplayer ? gameId : undefined);
  
  // Select the appropriate game state and actions
  const gameState = isMultiplayer ? multiplayerGame.gameState : singlePlayerGame.gameState;
  const isProcessing = isMultiplayer ? multiplayerGame.isLoading : singlePlayerGame.isProcessing;
  const makeMove = isMultiplayer ? 
    (position: number) => {
      // Handle multiplayer move
      const piece = gameState?.board[position];
      if (piece && gameState) {
        multiplayerGame.makeMove({
          type: 'make_move',
          fromPosition: position,
          toPosition: position + gameState.lastRoll,
          pieceId: piece.id
        });
        return true;
      }
      return false;
    } : 
    singlePlayerGame.makeMove;
  
  const throwSticks = isMultiplayer ? 
    () => {
      // Handle multiplayer throw
      const result = {
        sticks: Array.from({ length: 4 }, () => Math.random() < 0.5),
        value: 0
      };
      result.value = result.sticks.filter(s => s).length || 6;
      
      multiplayerGame.makeMove({
        type: 'throw_sticks',
        roll: result.value
      });
      
      return result;
    } : 
    singlePlayerGame.throwSticks;

  const resetGame = isMultiplayer ? 
    () => navigate('/senet') : 
    singlePlayerGame.resetGame;

  const { isThinking } = useSenetAI(
    isMultiplayer ? null : gameState, 
    isMultiplayer ? () => false : makeMove, 
    isMultiplayer ? () => null : throwSticks
  );
  
  const {
    isPlayingMusic,
    isMusicEnabled,
    toggleMusic,
    setMusicVolume,
    isSoundEnabled,
    toggleSoundEffects,
    setEffectsVolume,
    playStickThrow,
    playPieceMove,
    playPieceCapture,
    playGameStart,
    playGameWin,
    playGameLose,
    playTurnChange,
    playCriticalSquare
  } = useSenetAudio();
  
  const [musicVolume, setMusicVolumeState] = useState(20);
  const [effectsVolume, setEffectsVolumeState] = useState(30);
  
  const handleMusicVolumeChange = (value: number[]) => {
    const vol = value[0];
    setMusicVolumeState(vol);
    setMusicVolume(vol / 100);
  };
  
  const handleEffectsVolumeChange = (value: number[]) => {
    const vol = value[0];
    setEffectsVolumeState(vol);
    setEffectsVolume(vol / 100);
  };

  useEffect(() => {
    if (!isMultiplayer) {
      singlePlayerGame.setAIDifficulty(difficulty);
    }
  }, [difficulty, isMultiplayer]);

  // Start background music and game start sound when component mounts
  useEffect(() => {
    playGameStart();
  }, [playGameStart]);

  // Handle game state changes for audio
  useEffect(() => {
    if (gameState.winner) {
      if (gameState.winner === 1) {
        playGameWin();
      } else {
        playGameLose();
      }
    }
  }, [gameState.winner, playGameWin, playGameLose]);

  // Play turn change sound
  useEffect(() => {
    if (gameState.moveHistory.length > 0) {
      playTurnChange();
    }
  }, [gameState.currentPlayer, playTurnChange]);

  const handleSquareClick = (position: number) => {
    if (!gameState) return;
    
    if (gameState.gamePhase === 'moving' && gameState.availableMoves.includes(position)) {
      const piece = gameState.board[position];
      const currentPlayerIsAI = gameState.players.find(p => p.id === gameState.currentPlayer)?.isAI;
      
      // In multiplayer, check if it's the current user's turn
      if (isMultiplayer && multiplayerGame.onlineGame) {
        const isMyTurn = (gameState.currentPlayer === 1 && multiplayerGame.onlineGame.host_user_id === user?.id) ||
                        (gameState.currentPlayer === 2 && multiplayerGame.onlineGame.guest_user_id === user?.id);
        if (!isMyTurn) return;
      }
      
      if (piece && piece.player === gameState.currentPlayer && !currentPlayerIsAI) {
        // Check if there's a capture
        const targetPiece = gameState.board.find(p => p && p.position === position && p.player !== gameState.currentPlayer);
        if (targetPiece) {
          playPieceCapture();
        } else {
          playPieceMove();
        }
        makeMove(position);
      }
    }
  };

  const handleThrowSticks = () => {
    if (!gameState) return null;
    
    const currentPlayerIsAI = gameState.players.find(p => p.id === gameState.currentPlayer)?.isAI;
    
    // In multiplayer, check if it's the current user's turn
    if (isMultiplayer && multiplayerGame.onlineGame) {
      const isMyTurn = (gameState.currentPlayer === 1 && multiplayerGame.onlineGame.host_user_id === user?.id) ||
                      (gameState.currentPlayer === 2 && multiplayerGame.onlineGame.guest_user_id === user?.id);
      if (!isMyTurn) return null;
    }
    
    if (gameState.gamePhase === 'throwing' && !currentPlayerIsAI) {
      playStickThrow();
      return throwSticks();
    }
    return null;
  };

  // Return loading state if no game state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayerInfo = gameState.players.find(p => p.id === gameState.currentPlayer);
  const playerPieces = gameState.board.filter(p => p?.player === 1).length;
  const aiPieces = gameState.board.filter(p => p?.player === 2).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/senet')}
              className="text-foreground border-border hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
            <div className="text-2xl">𓋹</div>
            <h1 className="text-xl font-bold text-foreground">
              Ancient Senet {isMultiplayer && <Badge variant="secondary" className="ml-2"><Users className="h-3 w-3 mr-1" />Online</Badge>}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleMusic}
              className={cn(
                "border-border hover:bg-accent",
                !isMusicEnabled && "opacity-50"
              )}
              title={isMusicEnabled ? "Disable Background Music" : "Enable Background Music"}
            >
              {isMusicEnabled ? <Music className="h-4 w-4" /> : <Music className="h-4 w-4 opacity-50" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleSoundEffects}
              className={cn(
                "border-border hover:bg-accent",
                !isSoundEnabled && "opacity-50"
              )}
              title={isSoundEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
            >
              {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" onClick={resetGame} className="border-border hover:bg-accent">
              <RotateCcw className="h-4 w-4 mr-2" />
              New Game
            </Button>
            <div className="bg-background/80 rounded-lg p-1 border border-border/50">
              <FullscreenToggle />
            </div>
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
                <CardTitle className="text-base">Audio Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-4 w-4" />
                    <span className="font-medium">Music Volume</span>
                  </div>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={handleMusicVolumeChange}
                    max={100}
                    step={5}
                    className="w-full"
                    disabled={!isMusicEnabled}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {musicVolume}%
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4" />
                    <span className="font-medium">Effects Volume</span>
                  </div>
                  <Slider
                    value={[effectsVolume]}
                    onValueChange={handleEffectsVolumeChange}
                    max={100}
                    step={5}
                    className="w-full"
                    disabled={!isSoundEnabled}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {effectsVolume}%
                  </div>
                </div>
              </CardContent>
            </Card>

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