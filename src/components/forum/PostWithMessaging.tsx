import { useState, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageButton } from './MessageButton';
import BookmarkButton from './BookmarkButton';
import { UserAvatar } from '@/components/UserAvatar';
import { UserBadges } from '@/components/UserBadges';
import { ThumbsUp, MessageCircle, Send, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Post {
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
    email?: string;
  };
  forum_post_replies?: any[];
}

interface PostWithMessagingProps {
  post: Post;
  isUpvoted: boolean;
  onUpvote: () => void;
  onToggleReplies: () => void;
  showReplies: boolean;
  replies: any[];
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: () => void;
  submittingReply: boolean;
  formatDate?: (dateString: string) => string;
  isAuthenticated: boolean;
  onViewPost?: (id: string) => void;
  user?: any;
  onBookmarkRemove?: () => void;
  showBookmarkedAt?: boolean;
  bookmarkedAt?: string;
}

// Common emojis for easy insertion
const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '🌟', '✨'];

export const PostWithMessaging = memo(({ 
  post, 
  isUpvoted,
  onUpvote,
  onToggleReplies,
  showReplies,
  replies,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  submittingReply,
  formatDate,
  isAuthenticated,
  onViewPost,
  user: currentUser,
  onBookmarkRemove,
  showBookmarkedAt = false,
  bookmarkedAt
}: PostWithMessagingProps) => {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const authorName = post.profiles.display_name || (post.profiles.email ? post.profiles.email.split('@')[0] : 'Anonymous User');
  const replyCount = post.forum_post_replies?.length || replies.length || 0;

  const insertEmoji = (emoji: string) => {
    onReplyContentChange(replyContent + emoji);
    setShowEmojiPicker(false);
  };

  const handleEditPost = () => {
    setEditingPost(true);
    setEditPostContent(post.content);
  };

  const savePostEdit = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          content: editPostContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the post content in the UI (parent component would need to handle this)
      setEditingPost(false);
      toast.success('Post updated successfully!');
      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const cancelPostEdit = () => {
    setEditingPost(false);
    setEditPostContent('');
  };

  const handleEditReply = (replyId: string, currentContent: string) => {
    setEditingReply(replyId);
    setEditReplyContent(currentContent);
  };

  const saveReplyEdit = async (replyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('forum_post_replies')
        .update({ 
          content: editReplyContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingReply(null);
      setEditReplyContent('');
      toast.success('Reply updated successfully!');
      // Refresh to show updated reply
      window.location.reload();
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply');
    }
  };

  const cancelReplyEdit = () => {
    setEditingReply(null);
    setEditReplyContent('');
  };

  return (
    <Card className="border-0 shadow-xl bg-background/90 backdrop-blur-sm rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Author Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar size="sm" />
            <div>
              <p className="font-semibold text-sm">
                {authorName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {post.forum_categories?.name}
                </Badge>
                 <span className="text-xs text-muted-foreground">
                   {formatDate ? formatDate(post.created_at) : new Date(post.created_at).toLocaleDateString()}
                 </span>
                 {showBookmarkedAt && bookmarkedAt && (
                   <span className="text-xs text-primary">
                     • Bookmarked {formatDate ? formatDate(bookmarkedAt) : new Date(bookmarkedAt).toLocaleDateString()}
                   </span>
                 )}
              </div>
            </div>
          </div>
           <div className="flex items-center gap-2">
             <MessageButton recipientId={post.user_id} recipientName={authorName} />
             {onBookmarkRemove ? (
               <Button
                 variant="outline"
                 size="sm"
                 onClick={onBookmarkRemove}
                 className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
               >
                 Remove Bookmark
               </Button>
              ) : (
                <BookmarkButton postId={post.id} />
              )}
           </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Link 
              to={`/forum/${post.id}`}
              className="block group flex-1"
            >
              <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer">
                {post.title}
              </h3>
            </Link>
            {user?.id === post.user_id && !editingPost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditPost}
                className="ml-2 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
          
          {editingPost ? (
            <div className="space-y-3">
              <Textarea
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={4}
                className="rounded-xl border-border/30 bg-background/80 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelPostEdit}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={savePostEdit}
                  disabled={!editPostContent.trim()}
                  className="rounded-full"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {post.content}
            </p>
          )}
          
          {/* Post Image */}
          {post.image_url && (
            <Link to={`/forum/${post.id}`} className="block">
              <div className="forum-image-frame cursor-pointer group">
                <div className="forum-image-content">
                  <img 
                    src={post.image_url} 
                    alt="Post image" 
                    className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Engagement Section */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpvote}
              className={`flex items-center gap-2 rounded-full px-4 transition-all duration-200 ${
                isUpvoted
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.upvote_count}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleReplies}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary rounded-full px-4"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </span>
            </Button>
          </div>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-6 space-y-4 animate-fade-in">
            {/* Existing Replies */}
            {replies && replies.length > 0 && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                {replies.map((reply: any) => (
                  <div key={reply.id} className="bg-muted/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar size="sm" />
                        <span className="font-medium text-sm">
                          {reply.profiles?.display_name || 'Anonymous User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate ? formatDate(reply.created_at) : new Date(reply.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {user?.id === reply.user_id && editingReply !== reply.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReply(reply.id, reply.content)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {editingReply === reply.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                          rows={3}
                          className="rounded-xl border-border/30 bg-background/80 resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelReplyEdit}
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveReplyEdit(reply.id)}
                            disabled={!editReplyContent.trim()}
                            className="rounded-full"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {reply.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {isAuthenticated && (
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => onReplyContentChange(e.target.value)}
                    rows={2}
                    className="rounded-xl border-border/30 bg-background/50 text-sm resize-none pr-12"
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
                    onClick={onSubmitReply}
                    disabled={submittingReply || !replyContent.trim()}
                    className="rounded-full px-4 h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingReply ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
