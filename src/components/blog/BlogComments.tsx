import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useBlogComments, BlogComment } from '@/hooks/useBlogComments';
import { MessageCircle, Reply, Edit, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BlogCommentsProps {
  postId: string;
  postTitle: string;
}

interface CommentItemProps {
  comment: BlogComment;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  level = 0
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwnComment = currentUserId === comment.user_id;
  const displayName = comment.user?.display_name || comment.user?.email?.split('@')[0] || 'Anonymous';
  const maxLevel = 3; // Limit nesting depth

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${level > 0 ? 'ml-6 mt-3' : 'mt-4'}`}>
      <Card className="border-l-4 border-l-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  {comment.is_edited && <span className="ml-1">(edited)</span>}
                </p>
              </div>
            </div>
            
            {isOwnComment && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(comment.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {comment.content}
              </p>
              
              {level < maxLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs h-7 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          )}

          {showReplyForm && level < maxLevel && (
            <ReplyForm
              parentId={comment.id}
              postId={comment.post_id}
              onSubmit={(content) => {
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          )}

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ReplyFormProps {
  parentId: string;
  postId: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentId, postId, onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment } = useBlogComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(content, parentId);
      onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="min-h-[60px]"
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Reply'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const BlogComments: React.FC<BlogCommentsProps> = ({ postId, postTitle }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { comments, loading, addComment, updateComment, deleteComment } = useBlogComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content?: string) => {
    // This will be called from the reply form with content
    if (content) {
      try {
        await addComment(content, parentId);
      } catch (error) {
        console.error('Error submitting reply:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Comments</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Comments ({comments.length})
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this article..."
              className="min-h-[100px]"
              required
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Please sign in to join the conversation
            </p>
            <Link to="/auth">
              <Button>Sign In to Comment</Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={updateComment}
                onDelete={deleteComment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};