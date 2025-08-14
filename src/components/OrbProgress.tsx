import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gem, Download, MessageSquare, MessageCircle, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
            <Gem className="h-5 w-5 text-amber-500" />
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
            <Gem className="h-6 w-6 text-amber-500" />
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
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg text-center">
              <Sparkles className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-green-600">PDF Reward Claimed!</div>
              <div className="text-xs text-muted-foreground">
                Claimed on {new Date(orbData.pdf_claimed_at!).toLocaleDateString()}
              </div>
            </div>
          ) : orbData.total_orbs >= 100 ? (
            <Button 
              onClick={handleClaimPDF}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {claiming ? 'Claiming...' : 'Claim PDF Reward!'}
            </Button>
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
          <div>• 10 forum posts = 1 orb</div>
          <div>• 20 forum replies = 1 orb</div>
          <div>• 5,000 quiz points = 10 orbs</div>
        </div>
      </CardContent>
    </Card>
  );
};