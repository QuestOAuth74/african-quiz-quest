import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp, Target, Zap, Crown, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  user_id: string;
  total_games_played: number;
  total_questions_answered: number;
  total_questions_correct: number;
  total_points_earned: number;
  best_game_score: number;
  current_correct_streak: number;
  longest_correct_streak: number;
  user_email?: string;
  accuracy_percentage: number;
  avg_score_per_game: number;
  rank: number;
}

interface LeaderboardProps {
  onBack?: () => void;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState("total-points");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadLeaderboardData();
    }
  }, [isAuthenticated, activeTab]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get leaderboard data
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .order(getOrderByField(), { ascending: false })
        .limit(100);

      if (statsError) throw statsError;

      // Get user emails and filter out admin users
      const userIds = statsData?.map(stat => stat.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, is_admin')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Could not load user profiles:', profilesError);
      }

      // Filter out admin users and process the data
      const nonAdminProfiles = profilesData?.filter(profile => !profile.is_admin) || [];
      const nonAdminUserIds = nonAdminProfiles.map(profile => profile.user_id);
      
      const processedData = statsData
        ?.filter(stat => nonAdminUserIds.includes(stat.user_id))
        ?.map((stat, index) => {
          const profile = nonAdminProfiles.find(p => p.user_id === stat.user_id);
          return {
            ...stat,
            user_email: profile?.email || 'Anonymous User',
            accuracy_percentage: stat.total_questions_answered > 0 
              ? Math.round((stat.total_questions_correct / stat.total_questions_answered) * 100)
              : 0,
            avg_score_per_game: stat.total_games_played > 0 
              ? Math.round(stat.total_points_earned / stat.total_games_played)
              : 0,
            rank: index + 1
          };
        }) || [];

      setLeaderboardData(processedData);

      // Find current user's stats
      const currentUserStats = processedData.find(stat => stat.user_id === user?.id);
      setUserStats(currentUserStats || null);

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderByField = () => {
    switch (activeTab) {
      case "best-score":
        return "best_game_score";
      case "accuracy":
        return "total_questions_correct";
      case "streak":
        return "longest_correct_streak";
      default:
        return "total_points_earned";
    }
  };

  const handleResetStats = async () => {
    if (!user) return;

    try {
      setResetting(true);

      // Delete user's game history, question attempts, and stats
      const { error: gamesError } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', user.id);

      if (gamesError) throw gamesError;

      const { error: attemptsError } = await supabase
        .from('user_question_attempts')
        .delete()
        .eq('user_id', user.id);

      if (attemptsError) throw attemptsError;

      const { error: statsError } = await supabase
        .from('user_stats')
        .delete()
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      toast({
        title: "Stats Reset Successfully",
        description: "All your game history and statistics have been reset.",
        variant: "default",
      });

      // Reload the leaderboard data
      loadLeaderboardData();
    } catch (error) {
      console.error('Error resetting stats:', error);
      toast({
        title: "Error",
        description: "Failed to reset stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getStatValue = (stat: UserStats) => {
    switch (activeTab) {
      case "best-score":
        return `$${stat.best_game_score.toLocaleString()}`;
      case "accuracy":
        return `${stat.accuracy_percentage}%`;
      case "streak":
        return `${stat.longest_correct_streak} correct`;
      default:
        return `$${stat.total_points_earned.toLocaleString()}`;
    }
  };

  const getStatDescription = (stat: UserStats) => {
    switch (activeTab) {
      case "best-score":
        return `${stat.total_games_played} games played`;
      case "accuracy":
        return `${stat.total_questions_correct}/${stat.total_questions_answered} correct`;
      case "streak":
        return `Current: ${stat.current_correct_streak}`;
      default:
        return `Avg: $${stat.avg_score_per_game}/game`;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center p-4">
        <Card className="jeopardy-card max-w-md w-full">
          <CardHeader className="text-center">
            <Trophy className="w-12 h-12 text-theme-yellow mx-auto mb-4" />
            <CardTitle className="text-xl font-orbitron text-accent">
              Sign In Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please sign in to view the leaderboard and track your progress.
            </p>
            {onBack && (
              <Button onClick={onBack} className="jeopardy-button">
                Back to Game
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p className="text-theme-yellow font-orbitron">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-theme-yellow" />
              <div>
                <h1 className="font-orbitron font-black text-3xl md:text-4xl gradient-text">
                  Leaderboard
                </h1>
                <p className="text-theme-yellow-light font-exo">
                  Track your progress and compete with other players
                </p>
              </div>
            </div>
            {onBack && (
              <Button onClick={onBack} variant="outline" className="jeopardy-button">
                Back to Game
              </Button>
            )}
          </div>

          {/* User Stats Card */}
          {userStats && (
            <Card className="jeopardy-card mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-orbitron text-accent flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Your Stats
                  </CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="jeopardy-button text-xs"
                        disabled={resetting}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset Stats
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="jeopardy-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-accent">Reset All Statistics?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your game history, question attempts, and statistics. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="jeopardy-button">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleResetStats}
                          disabled={resetting}
                          className="jeopardy-button bg-destructive hover:bg-destructive/90"
                        >
                          {resetting ? "Resetting..." : "Reset Stats"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-theme-yellow">
                      #{userStats.rank}
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-theme-yellow">
                      ${userStats.total_points_earned.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-theme-yellow">
                      {userStats.accuracy_percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-theme-yellow">
                      {userStats.current_correct_streak}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Tabs */}
          <Card className="jeopardy-card">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-theme-brown-dark">
                  <TabsTrigger value="total-points" className="text-xs">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Total Points
                  </TabsTrigger>
                  <TabsTrigger value="best-score" className="text-xs">
                    <Trophy className="w-4 h-4 mr-1" />
                    Best Score
                  </TabsTrigger>
                  <TabsTrigger value="accuracy" className="text-xs">
                    <Target className="w-4 h-4 mr-1" />
                    Accuracy
                  </TabsTrigger>
                  <TabsTrigger value="streak" className="text-xs">
                    <Zap className="w-4 h-4 mr-1" />
                    Best Streak
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardData.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No leaderboard data yet. Play some games to see rankings!
                    </p>
                  </div>
                ) : (
                  leaderboardData.map((stat) => (
                    <div
                      key={stat.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        stat.user_id === user?.id
                          ? 'border-theme-yellow bg-theme-yellow/5'
                          : 'border-theme-yellow/30 hover:bg-theme-yellow/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(stat.rank)}
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">
                            {stat.user_email}
                            {stat.user_id === user?.id && (
                              <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getStatDescription(stat)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-theme-yellow">
                          {getStatValue(stat)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stat.total_games_played} games
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;