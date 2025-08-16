import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageButton } from './MessageButton';
import BookmarkButton from './BookmarkButton';
import { ThumbsUp, MessageCircle, Reply } from 'lucide-react';
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
  const authorName = post.profiles.display_name || (post.profiles.email ? post.profiles.email.split('@')[0] : 'Anonymous User');

  return (
    <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {post.forum_categories.name}
              </Badge>
              <span className="text-sm text-white/60">
                by {authorName}
              </span>
              <span className="text-sm text-white/40">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <MessageButton 
              recipientId={post.user_id}
              recipientName={authorName}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            />
            <BookmarkButton postId={post.id} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-white/80 mb-4 line-clamp-3">
          {post.content}
        </p>
        
        {post.image_url && (
          <div className="mb-4">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="rounded-lg max-w-full h-auto border border-white/20"
            />
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpvote}
            className={`flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 ${
              isUpvoted ? 'text-blue-400 hover:text-blue-300' : ''
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
            {post.upvote_count}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleReplies}
            className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10"
          >
            <MessageCircle className="w-4 h-4" />
            {replies.length} replies
          </Button>
        </div>
        
        {showReplies && (
          <div className="mt-4 space-y-3">
            {replies.map((reply: any) => (
              <div key={reply.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white/90">
                    {reply.profiles?.display_name || 'Anonymous User'}
                  </span>
                  <span className="text-xs text-white/50">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-sm text-white/80">{reply.content}</p>
              </div>
            ))}
            
            {isAuthenticated && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50"
                />
                <Button
                  onClick={onSubmitReply}
                  disabled={submittingReply || !replyContent.trim()}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Reply
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};