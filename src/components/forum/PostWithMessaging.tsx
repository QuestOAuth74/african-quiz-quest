import { useState } from 'react';
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
  formatDate: (dateString: string) => string;
  isAuthenticated: boolean;
}

// Common emojis for easy insertion
const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '🌟', '✨'];

export const PostWithMessaging = ({ 
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
  isAuthenticated
}: PostWithMessagingProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const authorName = post.profiles.display_name || (post.profiles.email ? post.profiles.email.split('@')[0] : 'Anonymous User');
  const replyCount = post.forum_post_replies?.length || replies.length || 0;

  const insertEmoji = (emoji: string) => {
    onReplyContentChange(replyContent + emoji);
    setShowEmojiPicker(false);
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
                  {formatDate(post.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageButton recipientId={post.user_id} recipientName={authorName} />
            <BookmarkButton postId={post.id} />
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {post.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {post.content}
          </p>
          
          {/* Post Image */}
          {post.image_url && (
            <div className="forum-image-frame">
              <div className="forum-image-content">
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <UserAvatar size="sm" />
                      <span className="font-medium text-sm">
                        {reply.profiles?.display_name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {reply.content}
                    </p>
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
};
