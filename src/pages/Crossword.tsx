import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CrosswordGrid } from '@/components/crossword/CrosswordGrid';
import { CrosswordClues } from '@/components/crossword/CrosswordClues';
import { CrosswordPuzzle, CrosswordWord, CrosswordGameState } from '@/types/crossword';
import { ArrowLeft, Clock, Trophy, Lightbulb, RotateCcw } from 'lucide-react';

export function Crossword() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState<CrosswordGameState>({
    puzzle: null,
    selectedWord: null,
    selectedCell: null,
    currentDirection: 'across',
    hintsUsed: 0,
    score: 0,
    timeElapsed: 0,
    isCompleted: false
  });
  const [loading, setLoading] = useState(true);

  usePageTitle("African History Crossword");

  useEffect(() => {
    checkAccess();
    loadPuzzle();
  }, [user]);

  useEffect(() => {
    if (gameState.puzzle && !gameState.isCompleted) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.puzzle, gameState.isCompleted]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      // Check if user is admin
      const { data: adminData } = await supabase.rpc('is_admin', { user_uuid: user.id });
      setIsAdmin(!!adminData);

      if (!adminData) {
        // Check if crossword is enabled for public
        const { data: featureData } = await supabase
          .from('feature_flags')
          .select('enabled_for_public')
          .eq('feature_name', 'crossword_puzzle')
          .single();

        if (!featureData?.enabled_for_public) {
          toast({
            title: "Access Denied",
            description: "Crossword puzzles are not yet available to the public",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/');
    }
  };

  const loadPuzzle = async () => {
    try {
      // Get a random active puzzle
      const { data: puzzles, error } = await supabase
        .from('crossword_puzzles')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      if (puzzles && puzzles.length > 0) {
        const puzzleData = puzzles[0];
        const wordsData = puzzleData.words_data as any;
        const puzzle: CrosswordPuzzle = {
          id: puzzleData.id,
          title: puzzleData.title,
          category: puzzleData.category,
          difficulty: puzzleData.difficulty,
          gridSize: 15, // Default grid size
          grid: puzzleData.grid_data as any,
          words: wordsData.words,
          clues: wordsData.clues,
          isCompleted: false,
          startTime: new Date()
        };

        setGameState(prev => ({ ...prev, puzzle }));
      } else {
        toast({
          title: "No Puzzles Available",
          description: "No crossword puzzles are currently available. Please check back later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to load crossword puzzle",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (!gameState.puzzle) return;

    // Find words that contain this cell
    const wordsAtCell = gameState.puzzle.words.filter(word => {
      if (word.direction === 'across') {
        return y === word.startY && x >= word.startX && x < word.startX + word.length;
      } else {
        return x === word.startX && y >= word.startY && y < word.startY + word.length;
      }
    });

    if (wordsAtCell.length === 0) return;

    // If clicking on the same cell, toggle direction
    if (gameState.selectedCell?.x === x && gameState.selectedCell?.y === y && wordsAtCell.length > 1) {
      const otherDirection = gameState.currentDirection === 'across' ? 'down' : 'across';
      const wordInOtherDirection = wordsAtCell.find(w => w.direction === otherDirection);
      if (wordInOtherDirection) {
        setGameState(prev => ({
          ...prev,
          selectedWord: wordInOtherDirection,
          currentDirection: otherDirection
        }));
        return;
      }
    }

    // Select the first word in the current direction, or first available word
    const wordInDirection = wordsAtCell.find(w => w.direction === gameState.currentDirection) || wordsAtCell[0];
    
    setGameState(prev => ({
      ...prev,
      selectedWord: wordInDirection,
      selectedCell: { x, y },
      currentDirection: wordInDirection.direction
    }));
  };

  const handleClueClick = (wordId: string) => {
    if (!gameState.puzzle) return;

    const word = gameState.puzzle.words.find(w => w.id === wordId);
    if (word) {
      setGameState(prev => ({
        ...prev,
        selectedWord: word,
        selectedCell: { x: word.startX, y: word.startY },
        currentDirection: word.direction
      }));
    }
  };

  const handleWordComplete = (wordId: string) => {
    if (!gameState.puzzle) return;

    const updatedWords = gameState.puzzle.words.map(word =>
      word.id === wordId ? { ...word, isCompleted: true } : word
    );

    const updatedAcrossClues = gameState.puzzle.clues.across.map(clue =>
      clue.wordId === wordId ? { ...clue, isCompleted: true } : clue
    );

    const updatedDownClues = gameState.puzzle.clues.down.map(clue =>
      clue.wordId === wordId ? { ...clue, isCompleted: true } : clue
    );

    const updatedPuzzle = {
      ...gameState.puzzle,
      words: updatedWords,
      clues: {
        across: updatedAcrossClues,
        down: updatedDownClues
      }
    };

    // Check if puzzle is complete
    const isCompleted = updatedWords.every(word => word.isCompleted);
    
    setGameState(prev => ({
      ...prev,
      puzzle: updatedPuzzle,
      isCompleted,
      score: prev.score + 100
    }));

    if (isCompleted) {
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed the crossword puzzle!",
      });
    } else {
      toast({
        title: "Word Complete! ✅",
        description: "Great job! Keep going!",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Please sign in to access crossword puzzles.</p>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p>Loading crossword puzzle...</p>
        </div>
      </div>
    );
  }

  if (!gameState.puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Puzzle Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>No crossword puzzles are currently available.</p>
            <Link to="/">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            {isAdmin && (
              <Badge variant="outline" className="text-theme-yellow border-theme-yellow">
                ADMIN PREVIEW
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(gameState.timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{gameState.score} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>{gameState.hintsUsed} hints</span>
            </div>
          </div>
        </div>

        {/* Puzzle Info */}
        <Card className="jeopardy-card mb-6">
          <CardHeader>
            <CardTitle className="text-theme-yellow text-center">
              {gameState.puzzle.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline">{gameState.puzzle.category}</Badge>
              <Badge variant="outline">Difficulty: {gameState.puzzle.difficulty}/5</Badge>
              <Badge variant="outline">
                {gameState.puzzle.words.filter(w => w.isCompleted).length}/{gameState.puzzle.words.length} Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Crossword Grid */}
          <div className="xl:col-span-2">
            <Card className="jeopardy-card">
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <CrosswordGrid
                    puzzle={gameState.puzzle}
                    selectedWord={gameState.selectedWord}
                    onCellClick={handleCellClick}
                    onWordComplete={handleWordComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clues */}
          <div className="xl:col-span-1">
            <CrosswordClues
              acrossClues={gameState.puzzle.clues.across}
              downClues={gameState.puzzle.clues.down}
              selectedWord={gameState.selectedWord}
              onClueClick={handleClueClick}
            />
          </div>
        </div>

        {/* Game Completed */}
        {gameState.isCompleted && (
          <Card className="jeopardy-card mt-6 border-green-500">
            <CardContent className="text-center p-6">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Puzzle Complete!</h3>
              <p className="text-muted-foreground mb-4">
                Completed in {formatTime(gameState.timeElapsed)} with {gameState.score} points
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Another Puzzle
                </Button>
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}