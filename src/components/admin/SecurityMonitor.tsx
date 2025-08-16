import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, Activity, Clock, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AdminActivity {
  id: string;
  user_id: string;
  display_name: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}

interface SecurityStats {
  totalActions24h: number;
  uniqueUsers24h: number;
  suspiciousActivity: number;
  topActions: Array<{ action: string; count: number }>;
}

export const SecurityMonitor = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSecurityData = async () => {
    try {
      // Get recent admin activity
      const { data: activityData, error: activityError } = await supabase
        .rpc('get_recent_admin_activity', { p_limit: 100 });

      if (activityError) {
        console.error('Failed to load admin activity:', activityError);
        return;
      }

      setActivities(activityData || []);

      // Calculate security stats
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recent24h = (activityData || []).filter(
        (activity: AdminActivity) => new Date(activity.created_at) > yesterday
      );

      const uniqueUsers = new Set(recent24h.map((a: AdminActivity) => a.user_id)).size;
      
      // Count suspicious activity (>10 actions in 30 minutes)
      let suspiciousCount = 0;
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const recentActions = (activityData || []).filter(
        (activity: AdminActivity) => new Date(activity.created_at) > thirtyMinutesAgo
      );
      
      const userActionCounts: Record<string, number> = {};
      recentActions.forEach((activity: AdminActivity) => {
        userActionCounts[activity.user_id] = (userActionCounts[activity.user_id] || 0) + 1;
      });
      
      suspiciousCount = Object.values(userActionCounts).filter(count => count > 10).length;

      // Count top actions
      const actionCounts: Record<string, number> = {};
      recent24h.forEach((activity: AdminActivity) => {
        actionCounts[activity.action_type] = (actionCounts[activity.action_type] || 0) + 1;
      });
      
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalActions24h: recent24h.length,
        uniqueUsers24h: uniqueUsers,
        suspiciousActivity: suspiciousCount,
        topActions
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearOldLogs = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('admin_action_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Old logs cleared successfully",
      });

      loadSecurityData();
    } catch (error) {
      console.error('Failed to clear old logs:', error);
      toast({
        title: "Error",
        description: "Failed to clear old logs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSecurityData();
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getActionBadgeVariant = (actionType: string) => {
    if (actionType.includes('delete')) return 'destructive';
    if (actionType.includes('create')) return 'default';
    if (actionType.includes('update')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActions24h || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniqueUsers24h || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.suspiciousActivity || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats?.suspiciousActivity || 0) === 0 ? 'Secure' : 'Alert'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Admin Activity
            </CardTitle>
            <CardDescription>Last 100 admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(activity.action_type)}>
                          {activity.action_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {activity.resource_type}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {activity.display_name || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No admin activity found
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Actions (24h)
            </CardTitle>
            <CardDescription>Most frequent admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topActions.map((item, index) => (
                <div key={item.action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    <Badge variant={getActionBadgeVariant(item.action)}>
                      {item.action}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
              {(!stats?.topActions || stats.topActions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No activity in the last 24 hours
                </p>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSecurityData}
                className="flex-1"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearOldLogs}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Old Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};