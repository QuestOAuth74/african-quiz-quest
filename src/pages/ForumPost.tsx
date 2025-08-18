import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ThumbsUp, MessageCircle, Send, Smile, Eye, Share, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import TopNavigation from '@/components/TopNavigation';
import { UserAvatar } from '@/components/UserAvatar';
import { UserBadges } from '@/components/UserBadges';
import { MessageButton } from '@/components/forum/MessageButton';
import BookmarkButton from '@/components/forum/BookmarkButton';
import { getDisplayName } from '@/lib/username-generator';

interface PostData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id: string;
  image_url: string | null;
  upvote_count: number;
  forum_categories: {
    name: string;
  };
  profiles: {
    display_name: string | null;
  };
}

interface ReplyData {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string | null;
  };
}

// Common emojis for easy insertion
const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '🌟', '✨'];

const ForumPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  usePageTitle(post?.title || 'Forum Post');

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchReplies();
      fetchUserUpvote();
    }
  }, [postId, user]);

  const fetchPost = async () => {
    try {
      // Fetch post data with explicit typing to avoid infinite type recursion
      const { data: postData, error }: { data: any | null; error: any } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .eq('moderation_status', 'approved')
        .single();

      if (error || !postData) {
        console.error('Error fetching post:', error);
        navigate('/forum');
        return;
      }

      // Fetch category data with explicit typing
      const { data: categoryData }: { data: any | null; error: any } = await supabase
        .from('forum_categories')
        .select('name')
        .eq('id', postData.category_id)
        .single();

      // Fetch profile data with explicit typing
      const { data: profileData }: { data: any | null; error: any } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', postData.user_id)
        .single();

      const post: PostData = {
        id: postData.id,
        title: postData.title,
        content: postData.content,
        created_at: postData.created_at,
        user_id: postData.user_id,
        category_id: postData.category_id,
        image_url: postData.image_url,
        upvote_count: postData.upvote_count,
        forum_categories: { name: categoryData?.name || 'Unknown Category' },
        profiles: { display_name: profileData?.display_name || null }
      };

      setPost(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/forum');
    }
  };

  const fetchReplies = async () => {
    try {
      // Fetch replies with explicit typing to avoid infinite type recursion
      const { data: repliesData, error }: { data: any[] | null; error: any } = await supabase
        .from('forum_post_replies')
        .select('*')
        .eq('post_id', postId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        setLoading(false);
        return;
      }

      if (!repliesData || repliesData.length === 0) {
        setReplies([]);
        setLoading(false);
        return;
      }

      // Get user profiles separately with explicit typing
      const userIds: string[] = [...new Set(repliesData.map((reply: any) => reply.user_id as string))];
      const { data: profiles }: { data: any[] | null; error: any } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const typedReplies: ReplyData[] = repliesData.map((reply: any) => {
        const profile = profiles?.find((p: any) => p.user_id === reply.user_id);
        return {
          id: reply.id,
          post_id: reply.post_id,
          user_id: reply.user_id,
          content: reply.content,
          created_at: reply.created_at,
          profiles: { display_name: profile?.display_name || null }
        };
      });

      setReplies(typedReplies);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUpvote = async () => {
    if (!user || !postId) return;

    try {
      const { data }: { data: any | null; error: any } = await supabase
        .from('forum_post_upvotes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsUpvoted(!!data);
    } catch (error) {
      // User hasn't upvoted this post
      setIsUpvoted(false);
    }
  };

  const toggleUpvote = async () => {
    if (!user || !post) {
      toast.error('Please sign in to upvote posts');
      return;
    }

    try {
      if (isUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('forum_post_upvotes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsUpvoted(false);
        setPost(prev => prev ? { ...prev, upvote_count: prev.upvote_count - 1 } : null);
      } else {
        // Add upvote
        const { error } = await supabase
          .from('forum_post_upvotes')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) throw error;

        setIsUpvoted(true);
        setPost(prev => prev ? { ...prev, upvote_count: prev.upvote_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error('Failed to update upvote');
    }
  };

  const submitReply = async () => {
    if (!user || !post) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmittingReply(true);

    try {
      const { error } = await supabase
        .from('forum_post_replies')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: replyContent.trim()
        });

      if (error) throw error;

      toast.success('Reply submitted! It will be visible once approved by a moderator.');
      setReplyContent('');
      setShowEmojiPicker(false);
      // Refresh replies to show new one if auto-approved
      await fetchReplies();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setReplyContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const sharePost = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Post link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link to="/forum">
              <Button>Return to Forum</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link 
            to="/forum" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Link>
        </div>

        {/* Main Post Card */}
        <Card className="border-0 shadow-xl bg-background/90 backdrop-blur-sm rounded-3xl overflow-hidden mb-8">
          <CardContent className="p-8">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  displayName={post.profiles?.display_name}
                  userId={post.user_id}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-lg">
                      {getDisplayName(post.profiles?.display_name, post.user_id)}
                    </h2>
                    <UserBadges userId={post.user_id} limit={3} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="px-2 py-1">
                      {post.forum_categories.name}
                    </Badge>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePost}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <MessageButton 
                  recipientId={post.user_id} 
                  recipientName={getDisplayName(post.profiles?.display_name, post.user_id)} 
                />
                <BookmarkButton postId={post.id} />
              </div>
            </div>

            {/* Post Title */}
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            {/* Post Content */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="forum-image-frame mb-6 cursor-pointer" onClick={() => setShowImageModal(true)}>
                <div className="forum-image-content">
                  <img 
                    src={post.image_url} 
                    alt="Post image" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}

            {/* Engagement Section */}
            <div className="flex items-center justify-between pt-6 border-t border-border/30">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleUpvote}
                  className={`flex items-center gap-2 rounded-full px-4 transition-all duration-200 ${
                    isUpvoted
                      ? 'text-primary bg-primary/10 hover:bg-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.upvote_count}</span>
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Viewed {formatDistanceToNow(new Date(post.created_at))} ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <Card className="border-0 shadow-xl bg-background/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-6">
              {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
            </h2>

            {/* Reply Input */}
            {isAuthenticated && (
              <div className="space-y-4 mb-8 p-6 bg-muted/30 rounded-2xl">
                <div className="relative">
                  <Textarea
                    placeholder="Share your thoughts on this post..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="rounded-xl border-border/30 bg-background/80 resize-none pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="bg-background border border-border/30 rounded-xl p-3 shadow-lg">
                    <div className="grid grid-cols-6 gap-2">
                      {commonEmojis.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji(emoji)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={submitReply}
                    disabled={submittingReply || !replyContent.trim()}
                    className="rounded-full px-6 h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingReply ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Replies */}
            {replies.length > 0 && (
              <div className="space-y-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="border-l-2 border-primary/20 pl-6">
                    <div className="bg-muted/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <UserAvatar 
                          displayName={reply.profiles?.display_name}
                          userId={reply.user_id}
                          size="sm"
                        />
                        <div>
                          <span className="font-medium text-sm">
                            {getDisplayName(reply.profiles?.display_name, reply.user_id)}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isAuthenticated && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      {showImageModal && post.image_url && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={post.image_url} 
              alt="Post image full size" 
              className="max-w-full max-h-full object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPost;
