import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookmarkedPost {
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
  bookmarked_at: string;
}

export const useBookmarks = (user: any) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedPosts = useCallback(async () => {
    if (!user) {
      setBookmarkedPosts([]);
      setLoading(false);
      return;
    }

    try {
      // First get the bookmark IDs
      const { data: bookmarks, error: bookmarkError } = await supabase
        .from('forum_post_bookmarks')
        .select('post_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookmarkError) {
        toast.error('Failed to load bookmarked posts');
        return;
      }

      if (!bookmarks || bookmarks.length === 0) {
        setBookmarkedPosts([]);
        return;
      }

      // Then get the post details
      const postIds = bookmarks.map(b => b.post_id);
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          category_id,
          image_url,
          upvote_count,
          forum_categories!fk_forum_posts_category_id(name),
          profiles!fk_forum_posts_user_id(display_name)
        `)
        .in('id', postIds)
        .eq('moderation_status', 'approved');

      if (postsError) {
        toast.error('Failed to load post details');
        return;
      }

      // Combine bookmarks with posts and sort by bookmark date
      const transformedData = bookmarks
        .map(bookmark => {
          const post = posts?.find(p => p.id === bookmark.post_id);
          if (!post) return null;
          return {
            ...post,
            bookmarked_at: bookmark.created_at
          };
        })
        .filter(Boolean) as BookmarkedPost[];

      setBookmarkedPosts(transformedData);
    } catch (error) {
      toast.error('Error loading bookmarked posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeBookmark = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('forum_post_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) {
        toast.error('Failed to remove bookmark');
        return;
      }

      setBookmarkedPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Error removing bookmark');
    }
  }, [user]);

  const isPostBookmarked = useCallback((postId: string) => {
    return bookmarkedPosts.some(post => post.id === postId);
  }, [bookmarkedPosts]);

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [fetchBookmarkedPosts]);

  return {
    bookmarkedPosts,
    loading,
    removeBookmark,
    isPostBookmarked,
    refetchBookmarks: fetchBookmarkedPosts
  };
};