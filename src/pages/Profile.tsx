import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit3, Save, X, Trophy, MessageSquare, Play } from 'lucide-react';
import { toast } from 'sonner';
import TopNavigation from '@/components/TopNavigation';
import { Link } from 'react-router-dom';
import { UserBadges } from '@/components/UserBadges';
import { UserAvatar } from '@/components/UserAvatar';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast.error('Failed to load profile');
        return;
      }

      setProfile(data);
      setDisplayName(data.display_name || '');
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load user stats:', error);
        return;
      }

      setUserStats(data || null);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() } : null);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '');
    setEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <TopNavigation />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-secondary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="relative container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        {/* Modern Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative mb-8">
            <UserAvatar 
              displayName={profile?.display_name} 
              email={user.email} 
              size="lg" 
              className="w-28 h-28 text-3xl mx-auto mb-8 border-4 border-primary/20 shadow-xl shadow-primary/10"
            />
            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {profile?.display_name || 'Welcome!'}
            </h1>
            <p className="text-muted-foreground text-xl">
              Historia Quiz Champion in the making
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              <CardHeader className="relative text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-foreground">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-8">
                {/* Display Name Section */}
                <div className="space-y-4">
                  <Label htmlFor="displayName" className="text-foreground font-semibold text-lg">
                    Display Name
                  </Label>
                  {editing ? (
                    <div className="flex gap-3">
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="flex-1 h-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={updating || !displayName.trim()}
                        className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                        size="sm"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="ghost"
                        className="h-12 px-6 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/30">
                      <span className="text-foreground font-semibold text-xl">
                        {profile?.display_name || 'No display name set'}
                      </span>
                      <Button
                        onClick={() => setEditing(true)}
                        variant="ghost"
                        className="h-10 w-10 rounded-lg hover:bg-background/80 hover:scale-110 transition-all duration-200"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/30">
                  <h3 className="font-bold text-foreground text-xl flex items-center gap-2">
                    <div className="p-1 bg-primary/20 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-muted-foreground font-medium">Account ID:</span>
                      <div className="font-mono text-sm bg-background/50 p-3 rounded-lg border border-border/30 break-all">
                        {user.id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-muted-foreground font-medium">Member since:</span>
                      <div className="font-semibold text-primary text-lg">
                        {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Achievements Section */}
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold text-foreground">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-lg">
                    <Trophy className="h-7 w-7 text-primary" />
                  </div>
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="min-h-[120px] flex items-center justify-center p-6 rounded-xl bg-gradient-to-br from-background/30 to-background/20 border border-border/20">
                  <UserBadges userId={user.id} showTooltip={true} size="lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="text-center text-xl font-bold text-foreground">
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                    <div className="text-2xl font-black text-primary mb-1">
                      {userStats?.total_games_played || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Games</div>
                  </div>
                  <div className="p-4 text-center bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                    <div className="text-2xl font-black text-primary mb-1">
                      {userStats?.best_game_score || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Best Score</div>
                  </div>
                </div>
                <div className="p-4 text-center bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                  <div className="text-xl font-black text-primary mb-1">
                    {userStats?.total_questions_correct || 0}/{userStats?.total_questions_answered || 0}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Correct Answers</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                    <div className="text-xl font-black text-primary mb-1">
                      {userStats?.current_correct_streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Current Streak</div>
                  </div>
                  <div className="p-4 text-center bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30">
                    <div className="text-xl font-black text-primary mb-1">
                      {userStats?.longest_correct_streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Best Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="text-center text-xl font-bold text-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <Link to="/forum" className="block">
                  <Button 
                    className="w-full h-12 rounded-xl bg-background/50 text-foreground border border-border/50 hover:bg-background/80 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                    variant="ghost"
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Visit Forum
                  </Button>
                </Link>
                <Link to="/leaderboard" className="block">
                  <Button 
                    className="w-full h-12 rounded-xl bg-background/50 text-foreground border border-border/50 hover:bg-background/80 hover:scale-[1.02] transition-all duration-200 shadow-lg"
                    variant="ghost"
                  >
                    <Trophy className="h-5 w-5 mr-3" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button 
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Play className="h-5 w-5 mr-3" />
                    Play Game
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;