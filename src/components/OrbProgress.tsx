import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, MessageCircle, Trophy, Sparkles, Crown, Star } from 'lucide-react';
import { OrbIcon } from './OrbIcon';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface UserOrbData {
  total_orbs: number;
  orbs_from_posts: number;
  orbs_from_replies: number;
  orbs_from_quiz_points: number;
  pdf_claimed: boolean;
  pdf_claimed_at: string | null;
}

interface OrbProgressProps {
  userId: string;
}

export const OrbProgress = ({ userId }: OrbProgressProps) => {
  const [orbData, setOrbData] = useState<UserOrbData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchOrbData();
  }, [userId]);

  // Trigger confetti when user reaches 100 orbs
  useEffect(() => {
    if (orbData && orbData.total_orbs >= 100 && !orbData.pdf_claimed) {
      triggerCelebration();
    }
  }, [orbData]);

  const triggerCelebration = () => {
    // Multi-burst confetti celebration
    const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'];
    
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });

    // Second burst from left
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
    }, 250);

    // Third burst from right
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
    }, 400);

    // Final shower
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        startVelocity: 45,
        origin: { y: 0.4 },
        colors: colors
      });
    }, 600);
  };

  const fetchOrbData = async () => {
    try {
      // First calculate current orbs
      await supabase.rpc('calculate_user_orbs', { p_user_id: userId });
      
      // Then fetch the data
      const { data, error } = await supabase
        .from('user_orbs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching orb data:', error);
        return;
      }

      setOrbData(data || {
        total_orbs: 0,
        orbs_from_posts: 0,
        orbs_from_replies: 0,
        orbs_from_quiz_points: 0,
        pdf_claimed: false,
        pdf_claimed_at: null
      });
    } catch (error) {
      console.error('Error fetching orb data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPDF = async () => {
    if (!orbData || orbData.total_orbs < 100 || orbData.pdf_claimed) return;

    setClaiming(true);
    try {
      const { error } = await supabase
        .from('user_orbs')
        .update({ 
          pdf_claimed: true, 
          pdf_claimed_at: new Date().toISOString() 
        })
        .eq('user_id', userId);

      if (error) {
        toast.error('Failed to claim PDF reward');
        return;
      }

      setOrbData(prev => prev ? { ...prev, pdf_claimed: true, pdf_claimed_at: new Date().toISOString() } : null);
      toast.success('🎉 Congratulations! Your PDF reward has been unlocked!');
      
      // Here you would typically trigger the PDF download or email
      // For now, we'll just show a success message
    } catch (error) {
      toast.error('Error claiming PDF reward');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card via-card to-card/90">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orbData) return null;

  const progressPercentage = Math.min((orbData.total_orbs / 100) * 100, 100);
  const remainingOrbs = Math.max(100 - orbData.total_orbs, 0);

  return (
    <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-bold">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl">
            <OrbIcon className="text-amber-500" size={20} />
          </div>
          <span className="bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
            Orb Collection
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Total Orbs Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <OrbIcon className="text-amber-500" size={24} />
            <span className="text-3xl font-black bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
              {orbData.total_orbs}
            </span>
            <span className="text-muted-foreground text-lg font-medium">/ 100</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-muted/50 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-purple-500"
          />
        </div>

        {/* Orb Sources Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-background/30 rounded-lg border border-border/30">
            <MessageSquare className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-blue-500">{orbData.orbs_from_posts}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div className="p-3 bg-background/30 rounded-lg border border-border/30">
            <MessageCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-green-500">{orbData.orbs_from_replies}</div>
            <div className="text-xs text-muted-foreground">Replies</div>
          </div>
          <div className="p-3 bg-background/30 rounded-lg border border-border/30">
            <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <div className="text-sm font-bold text-amber-500">{orbData.orbs_from_quiz_points}</div>
            <div className="text-xs text-muted-foreground">Quiz</div>
          </div>
        </div>

        {/* Progress toward PDF */}
        <div className="space-y-3">
          {orbData.pdf_claimed ? (
            <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                <Sparkles className="h-6 w-6 text-green-500" />
                <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="text-lg font-bold text-green-600 mb-2">🎉 PDF Reward Claimed! 🎉</div>
              <div className="text-sm text-muted-foreground">
                Claimed on {new Date(orbData.pdf_claimed_at!).toLocaleDateString()}
              </div>
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                You will be contacted by The Admin within 72 hours with your free PDF copy!
              </div>
            </div>
          ) : orbData.total_orbs >= 100 ? (
            <div className="space-y-4">
              {/* Congratulatory Message */}
              <div className="p-6 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-pink-500/15 border-2 border-gradient-to-r border-amber-500/30 rounded-xl text-center space-y-4 animate-scale-in">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Star className="h-8 w-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
                  <Crown className="h-10 w-10 text-yellow-500 animate-pulse" />
                  <Star className="h-8 w-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    🎊 CONGRATULATIONS! 🎊
                  </h3>
                  <p className="text-lg font-bold text-foreground">
                    You've achieved 100 Orbs!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    What an incredible accomplishment! Your dedication to learning history is truly inspiring.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 p-4 rounded-lg border border-amber-500/20">
                  <div className="text-sm font-semibold text-foreground mb-2">
                    🎁 Your Exclusive Reward Awaits!
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    "Black Africa: An Illustrated History" - Free PDF Edition
                  </div>
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>📧 What happens next:</strong><br />
                    The Admin will personally contact you within 72 hours to deliver your free electronic PDF copy directly to your email!
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <Button 
                onClick={handleClaimPDF}
                disabled={claiming}
                className="w-full h-14 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 text-white hover:from-amber-600 hover:via-purple-600 hover:to-pink-600 shadow-xl text-lg font-bold animate-pulse"
              >
                <Download className="h-5 w-5 mr-3" />
                {claiming ? 'Processing Your Reward...' : 'Claim Your PDF Reward!'}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-background/30 border border-border/30 rounded-lg text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Collect {remainingOrbs} more orbs to unlock:
              </div>
              <div className="text-sm font-bold text-foreground">
                "Black Africa: An Illustrated History" PDF
              </div>
            </div>
          )}
        </div>

        {/* How to earn more orbs */}
        <div className="text-xs text-muted-foreground space-y-1 bg-background/30 p-3 rounded-lg border border-border/30">
          <div className="font-medium text-foreground mb-2">Earn more orbs:</div>
          <div>• 10 forum posts = 5 orbs</div>
          <div>• 20 forum replies = 7 orbs</div>
          <div>• 5,000 quiz points = 5 orbs</div>
        </div>
      </CardContent>
    </Card>
  );
};