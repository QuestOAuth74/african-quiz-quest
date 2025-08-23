import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  parent_comment_id?: string;
  user?: {
    display_name?: string;
    email: string;
  };
  replies?: BlogComment[];
}

export const useBlogComments = (postId: string) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          user:profiles(display_name, email)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into a tree structure
      const commentsMap = new Map();
      const rootComments: BlogComment[] = [];

      // First pass: create all comment objects
      data?.forEach(comment => {
        const commentWithReplies = {
          ...comment,
          replies: []
        };
        commentsMap.set(comment.id, commentWithReplies);
      });

      // Second pass: organize into parent-child relationships
      data?.forEach(comment => {
        const commentObj = commentsMap.get(comment.id);
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentObj);
          }
        } else {
          rootComments.push(commentObj);
        }
      });

      setComments(rootComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentCommentId?: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          content: content.trim(),
          parent_comment_id: parentCommentId || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          user:profiles(display_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment posted successfully",
      });

      // Refresh comments to get the updated tree
      fetchComments();
      
      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          content: content.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });

      fetchComments();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    refreshComments: fetchComments,
  };
};