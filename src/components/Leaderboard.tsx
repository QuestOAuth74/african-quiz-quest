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
  display_name: string;
  total_points_vs_computer: number;
  best_category_name: string;
  best_category_points: number;
  total_games_vs_computer: number;
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
      
      // Get single player stats using our custom function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_single_player_stats');

      if (statsError) throw statsError;

      // Process the data and add rank
      const processedData = (statsData || []).map((stat, index) => ({
        ...stat,
        rank: index + 1
      }));

      // Sort by active tab
      const sortedData = [...processedData].sort((a, b) => {
        switch (activeTab) {
          case "best-category":
            return b.best_category_points - a.best_category_points;
          default:
            return b.total_points_vs_computer - a.total_points_vs_computer;
        }
      }).map((stat, index) => ({
        ...stat,
        rank: index + 1
      }));

      setLeaderboardData(sortedData);

      // Find current user's stats
      const currentUserStats = sortedData.find(stat => stat.user_id === user?.id);
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
      case "best-category":
        return `$${stat.best_category_points.toLocaleString()}`;
      default:
        return `$${stat.total_points_vs_computer.toLocaleString()}`;
    }
  };

  const getStatDescription = (stat: UserStats) => {
    switch (activeTab) {
      case "best-category":
        return stat.best_category_name || "No category played";
      default:
        return `${stat.total_games_vs_computer} games played`;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <Card className="relative border-border/50 shadow-2xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-lg max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none rounded-lg" />
          <CardHeader className="relative text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              Sign In Required
            </CardTitle>
          </CardHeader>
          <CardContent className="relative text-center">
            <p className="text-muted-foreground mb-6">
              Please sign in to view the leaderboard and track your progress.
            </p>
            {onBack && (
              <Button 
                onClick={onBack} 
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-foreground font-semibold text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-lg backdrop-blur-sm border border-border/30">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Leaderboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your progress and compete with other players
              </p>
            </div>
          </div>
          {onBack && (
            <Button 
              onClick={onBack} 
              variant="ghost" 
              className="rounded-full px-6 h-12 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Back to Game
            </Button>
          )}
        </div>

        {/* Modern User Stats Card */}
        {userStats && (
          <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  Your Performance
                </CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-4 h-10 bg-background/50 border border-border/50 hover:bg-background/80 transition-all duration-200"
                      disabled={resetting}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Stats
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-border/50 bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Reset All Statistics?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete all your game history, question attempts, and statistics. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleResetStats}
                        disabled={resetting}
                        className="rounded-xl bg-destructive hover:bg-destructive/90"
                      >
                        {resetting ? "Resetting..." : "Reset Stats"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                  <div className="text-3xl font-black text-primary mb-1">
                    #{userStats.rank}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Overall Rank</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                  <div className="text-3xl font-black text-primary mb-1">
                    ${userStats.total_points_vs_computer.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Total Points</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                  <div className="text-3xl font-black text-primary mb-1">
                    {userStats.best_category_name || "None"}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Best Category (${userStats.best_category_points})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Leaderboard Card */}
        <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
          <CardHeader className="relative">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm rounded-xl p-1 border border-border/30">
                <TabsTrigger value="total-points" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold transition-all duration-200">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Total Points
                </TabsTrigger>
                <TabsTrigger value="best-category" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold transition-all duration-200">
                  <Trophy className="w-4 h-4 mr-2" />
                  Best Category
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {leaderboardData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Rankings Yet</h3>
                  <p className="text-muted-foreground">
                    Play some games to see rankings and compete with other players!
                  </p>
                </div>
              ) : (
                leaderboardData.map((stat, index) => (
                  <div
                    key={stat.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                      stat.user_id === user?.id
                        ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-border/30 bg-background/30 hover:bg-background/50 hover:border-border/50'
                    } ${index < 3 ? 'hover:scale-[1.02]' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-background/50 to-background/30 border border-border/30">
                        {getRankIcon(stat.rank)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {stat.display_name}
                          {stat.user_id === user?.id && (
                            <Badge variant="secondary" className="text-xs rounded-full px-2 py-1">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getStatDescription(stat)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-primary">
                        {getStatValue(stat)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.total_games_vs_computer} games
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
  );
}

export default Leaderboard;