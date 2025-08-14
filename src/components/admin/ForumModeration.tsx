import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, MessageSquare, FileText } from 'lucide-react';

interface ModerationItem {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  user_email: string;
  moderation_status: string;
  type: 'post' | 'reply';
  post_id?: string;
}

export default function ForumModeration() {
  const [pendingItems, setPendingItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch pending posts
      const { data: posts } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          moderation_status,
          user_id
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch pending replies
      const { data: replies } = await supabase
        .from('forum_post_replies')
        .select(`
          id,
          content,
          created_at,
          moderation_status,
          post_id,
          user_id
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      // Get user emails separately
      const userIds = [
        ...(posts || []).map(p => p.user_id),
        ...(replies || []).map(r => r.user_id)
      ];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const userEmailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      const formattedPosts: ModerationItem[] = (posts || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        user_email: userEmailMap.get(post.user_id) || 'Unknown',
        moderation_status: post.moderation_status,
        type: 'post' as const
      }));

      const formattedReplies: ModerationItem[] = (replies || []).map(reply => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.created_at,
        user_email: userEmailMap.get(reply.user_id) || 'Unknown',
        moderation_status: reply.moderation_status,
        type: 'reply' as const,
        post_id: reply.post_id
      }));

      setPendingItems([...formattedPosts, ...formattedReplies].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const moderateItem = async (id: string, type: 'post' | 'reply', status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      const table = type === 'post' ? 'forum_posts' : 'forum_post_replies';
      
      const { error } = await supabase
        .from(table)
        .update({
          moderation_status: status,
          moderated_by: user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`${type} ${status} successfully`);
      fetchPendingItems();
    } catch (error) {
      console.error('Error moderating item:', error);
      toast.error(`Failed to ${status} ${type}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading moderation queue...</div>;
  }

  const pendingPosts = pendingItems.filter(item => item.type === 'post');
  const pendingReplies = pendingItems.filter(item => item.type === 'reply');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forum Moderation</h2>
          <p className="text-muted-foreground">
            Review and moderate forum posts and replies
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingItems.length} pending
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            All Pending ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Replies ({pendingReplies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pendingItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No items pending moderation at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingItems.map((item) => (
              <Card key={`${item.type}-${item.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === 'post' ? <FileText className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      <CardTitle className="text-lg">
                        {item.title || `Reply${item.post_id ? ` to post` : ''}`}
                      </CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(item.moderation_status)}
                        {item.moderation_status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By: {item.user_email}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'approved')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'rejected')}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {pendingPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending posts</h3>
                <p className="text-muted-foreground">
                  All forum posts have been moderated.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingPosts.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By: {item.user_email}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'approved')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'rejected')}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="replies" className="space-y-4">
          {pendingReplies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending replies</h3>
                <p className="text-muted-foreground">
                  All forum replies have been moderated.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReplies.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Reply to Post</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By: {item.user_email}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'approved')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => moderateItem(item.id, item.type, 'rejected')}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}