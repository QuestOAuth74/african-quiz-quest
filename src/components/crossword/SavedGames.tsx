import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCrosswordGameState } from '@/hooks/useCrosswordGameState';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Trash2, Play } from 'lucide-react';

interface SavedGame {
  id: string;
  puzzle_id: string;
  time_elapsed: number;
  score: number;
  hints_used: number;
  updated_at: string;
  crossword_puzzles: {
    id: string;
    title: string;
    category: string;
    difficulty: number;
  };
}

export function SavedGames() {
  const { user } = useAuth();
  const { getSavedGames, deleteSavedGame } = useCrosswordGameState(user?.id);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedGames();
  }, [user]);

  const loadSavedGames = async () => {
    setLoading(true);
    const games = await getSavedGames();
    setSavedGames(games as SavedGame[]);
    setLoading(false);
  };

  const handleDeleteGame = async (puzzleId: string) => {
    await deleteSavedGame(puzzleId);
    loadSavedGames(); // Refresh the list
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading saved games...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedGames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No saved games found</p>
            <p className="text-sm text-muted-foreground">
              Start a crossword puzzle and your progress will be automatically saved
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Playing ({savedGames.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedGames.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">
                {game.crossword_puzzles.title}
              </h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {game.crossword_puzzles.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(game.time_elapsed)}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {game.score} pts
                </div>
                <span className="text-xs">
                  {formatDate(game.updated_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Link to={`/crossword/play/${game.puzzle_id}`}>
                <Button size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteGame(game.puzzle_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}