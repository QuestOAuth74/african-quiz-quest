import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';

interface ForumStatsProps {
  selectedCategory: string;
}

interface Stats {
  totalPosts: number;
  totalReplies: number;
  activeUsers: number;
  todaysPosts: number;
}

const ForumStats = ({ selectedCategory }: ForumStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalReplies: 0,
    activeUsers: 0,
    todaysPosts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [selectedCategory]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get base query for posts
      let postsQuery = supabase
        .from('forum_posts')
        .select('*', { count: 'exact' })
        .eq('moderation_status', 'approved');
      
      if (selectedCategory !== 'all') {
        postsQuery = postsQuery.eq('category_id', selectedCategory);
      }

      // Get posts count
      const { count: totalPosts } = await postsQuery;

      // Get today's posts
      const today = new Date().toISOString().split('T')[0];
      let todaysQuery = supabase
        .from('forum_posts')
        .select('*', { count: 'exact' })
        .eq('moderation_status', 'approved')
        .gte('created_at', today);
      
      if (selectedCategory !== 'all') {
        todaysQuery = todaysQuery.eq('category_id', selectedCategory);
      }

      const { count: todaysPosts } = await todaysQuery;

      // Get replies count
      const { count: totalReplies } = await supabase
        .from('forum_post_replies')
        .select('*', { count: 'exact' })
        .eq('moderation_status', 'approved');

      // Get active users (users who posted in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsersData } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('moderation_status', 'approved')
        .gte('created_at', thirtyDaysAgo);

      const uniqueUsers = new Set(activeUsersData?.map(post => post.user_id) || []);

      setStats({
        totalPosts: totalPosts || 0,
        totalReplies: totalReplies || 0,
        activeUsers: uniqueUsers.size,
        todaysPosts: todaysPosts || 0
      });
    } catch (error) {
      console.error('Error fetching forum stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Forum Statistics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Posts</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.totalPosts}</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-accent/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Replies</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.totalReplies}</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-secondary/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">Active</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.activeUsers}</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Today</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.todaysPosts}</div>
            {stats.todaysPosts > 0 && (
              <Badge variant="outline" className="text-xs mt-1 bg-green-500/10 text-green-600 border-green-200">
                +{stats.todaysPosts} new
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumStats;