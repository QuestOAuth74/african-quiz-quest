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
    <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full jeopardy-card mb-4 mx-auto">
              <UserAvatar 
                displayName={profile?.display_name} 
                email={user.email} 
                size="lg" 
                className="w-20 h-20 text-2xl border-2 border-theme-yellow"
              />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2 jeopardy-text-glow">
              {profile?.display_name || 'Welcome!'}
            </h1>
            <p className="text-muted-foreground text-lg">
              Jeopardy Champion in the making
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="jeopardy-card border-theme-yellow/20 animate-scale-in">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-theme-yellow">
                  <User className="h-6 w-6" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Name Section */}
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-theme-yellow font-medium">
                    Display Name
                  </Label>
                  {editing ? (
                    <div className="flex gap-2">
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="flex-1 bg-theme-brown-dark border-theme-yellow/30 focus:border-theme-yellow"
                      />
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={updating || !displayName.trim()}
                        className="jeopardy-gold font-medium"
                        size="sm"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-theme-yellow/30 hover:border-theme-yellow"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20">
                      <span className="text-foreground font-medium text-lg">
                        {profile?.display_name || 'No display name set'}
                      </span>
                      <Button
                        onClick={() => setEditing(true)}
                        variant="ghost"
                        className="hover:bg-theme-yellow/10 hover:text-theme-yellow"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="space-y-4 p-4 rounded-lg bg-theme-brown-dark/30 border border-theme-yellow/10">
                  <h3 className="font-semibold text-theme-yellow text-lg">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Account ID:</span>
                      <div className="font-mono text-xs bg-theme-brown/50 p-2 rounded border border-theme-yellow/20 break-all">
                        {user.id}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Member since:</span>
                      <div className="font-medium text-theme-yellow">
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

            {/* Achievements Section */}
            <Card className="jeopardy-card border-theme-yellow/20 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-theme-yellow">
                  <div className="p-2 rounded-full bg-theme-yellow/20">
                    <Trophy className="h-6 w-6 text-theme-yellow" />
                  </div>
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[100px] flex items-center justify-center">
                  <UserBadges userId={user.id} showTooltip={true} size="lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="jeopardy-card border-theme-yellow/20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-center text-lg text-theme-yellow">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20">
                    <div className="text-2xl font-bold text-theme-yellow">
                      {userStats?.total_games_played || 0}
                    </div>
                    <div className="text-muted-foreground">Games</div>
                  </div>
                  <div className="p-3 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20">
                    <div className="text-2xl font-bold text-theme-yellow">
                      {userStats?.best_game_score || 0}
                    </div>
                    <div className="text-muted-foreground">Best Score</div>
                  </div>
                  <div className="p-3 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20 col-span-2">
                    <div className="text-xl font-bold text-theme-yellow">
                      {userStats?.total_questions_correct || 0}/{userStats?.total_questions_answered || 0}
                    </div>
                    <div className="text-muted-foreground">Correct Answers</div>
                  </div>
                  <div className="p-3 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20">
                    <div className="text-xl font-bold text-theme-yellow">
                      {userStats?.current_correct_streak || 0}
                    </div>
                    <div className="text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="p-3 rounded-lg bg-theme-brown-dark/50 border border-theme-yellow/20">
                    <div className="text-xl font-bold text-theme-yellow">
                      {userStats?.longest_correct_streak || 0}
                    </div>
                    <div className="text-muted-foreground">Best Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="jeopardy-card border-theme-yellow/20 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="text-center text-lg text-theme-yellow">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/forum" className="block">
                  <Button 
                    className="w-full jeopardy-button text-theme-yellow border-theme-yellow/30 hover:border-theme-yellow"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Visit Forum
                  </Button>
                </Link>
                <Link to="/leaderboard" className="block">
                  <Button 
                    className="w-full jeopardy-button text-theme-yellow border-theme-yellow/30 hover:border-theme-yellow"
                    variant="outline"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button 
                    className="w-full jeopardy-gold font-medium"
                  >
                    <Play className="h-4 w-4 mr-2" />
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