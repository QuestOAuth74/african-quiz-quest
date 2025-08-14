import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp, Eye, Calendar } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { UserBadges } from '@/components/UserBadges';

interface PostPreviewProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user_id: string;
    upvote_count: number;
    forum_categories: {
      name: string;
    };
    profiles: {
      display_name: string | null;
    };
  };
  replyCount: number;
  onViewPost: () => void;
  onUpvote: () => void;
  isUpvoted: boolean;
}

const PostPreview = ({ 
  post, 
  replyCount, 
  onViewPost, 
  onUpvote, 
  isUpvoted 
}: PostPreviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="border-border/50 hover:shadow-md transition-all duration-200 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar 
              displayName={post.profiles?.display_name}
              size="md"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {post.profiles?.display_name || 'Anonymous User'}
                </span>
                <UserBadges userId={post.user_id} limit={2} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="px-2 py-0.5">
                  {post.forum_categories.name}
                </Badge>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-2" onClick={onViewPost}>
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {truncateContent(post.content)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={isUpvoted ? "default" : "ghost"}
              size="sm"
              onClick={onUpvote}
              className="flex items-center gap-1 h-8"
            >
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs">{post.upvote_count}</span>
            </Button>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">{replyCount}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewPost}
            className="flex items-center gap-1 h-8"
          >
            <Eye className="h-3 w-3" />
            <span className="text-xs">View</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostPreview;