import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
}

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
  };
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string | null;
  };
}

interface ForumFilters {
  selectedCategory: string;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  timeFilter: string;
  userFilter: string;
  popularityFilter: string;
}

export const useForumData = (user: any, filters: ForumFilters) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<{ [postId: string]: Reply[] }>({});
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
  }, []);

  const buildPostsQuery = useCallback(() => {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories!fk_forum_posts_category_id(name),
        profiles!fk_forum_posts_user_id(display_name),
        forum_post_replies!fk_forum_post_replies_post_id(id)
      `)
      .eq('moderation_status', 'approved');

    // Category filter
    if (filters.selectedCategory !== 'all') {
      query = query.eq('category_id', filters.selectedCategory);
    }

    // Search filter
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%`);
    }

    // Time filter
    if (filters.timeFilter !== 'all') {
      const now = new Date();
      let timeThreshold: Date;
      
      switch (filters.timeFilter) {
        case 'today':
          timeThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          timeThreshold = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          timeThreshold = new Date(0);
      }
      
      query = query.gte('created_at', timeThreshold.toISOString());
    }

    // User filter
    if (filters.userFilter !== 'all' && user) {
      switch (filters.userFilter) {
        case 'my-posts':
          query = query.eq('user_id', user.id);
          break;
        case 'my-replies':
          // This would need a more complex query to get posts where user has replied
          break;
      }
    }

    // Popularity filter
    if (filters.popularityFilter !== 'all') {
      switch (filters.popularityFilter) {
        case 'trending':
          query = query.gte('upvote_count', 5);
          break;
        case 'hot':
          query = query.gte('upvote_count', 10);
          break;
        case 'no-replies':
          // This would need a more complex query
          break;
      }
    }

    // Sorting
    const ascending = filters.sortOrder === 'asc';
    query = query.order(filters.sortBy, { ascending });

    return query;
  }, [filters, user]);

  const fetchPosts = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce the request
    debounceTimerRef.current = setTimeout(async () => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        const query = buildPostsQuery();
        const { data, error } = await query;
        
        if (error && !abortController.signal.aborted) {
          toast.error('Failed to load posts');
          setLoading(false);
          return;
        }
        
        if (!abortController.signal.aborted) {
          setPosts(data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          toast.error('Failed to load posts');
          setLoading(false);
        }
      }
    }, 300);
  }, [buildPostsQuery]);

  const fetchUserUpvotes = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('forum_post_upvotes')
      .select('post_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setUserUpvotes(new Set(data.map(upvote => upvote.post_id)));
    }
  }, [user]);

  const fetchReplies = useCallback(async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_post_replies')
      .select(`
        *,
        profiles!fk_forum_post_replies_user_id(display_name)
      `)
      .eq('post_id', postId)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setReplies(prev => ({ ...prev, [postId]: data }));
    }
  }, []);

  const toggleUpvote = useCallback(async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to upvote posts');
      return;
    }

    const isUpvoted = userUpvotes.has(postId);

    try {
      if (isUpvoted) {
        const { error } = await supabase
          .from('forum_post_upvotes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Failed to remove upvote');
          return;
        }

        setUserUpvotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('forum_post_upvotes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) {
          toast.error('Failed to upvote post');
          return;
        }

        setUserUpvotes(prev => new Set(prev).add(postId));
      }

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, upvote_count: post.upvote_count + (isUpvoted ? -1 : 1) }
          : post
      ));
    } catch (error) {
      toast.error('Error updating upvote');
    }
  }, [user, userUpvotes]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
    
    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchPosts]);

  useEffect(() => {
    if (user) {
      fetchUserUpvotes();
    }
  }, [user, fetchUserUpvotes]);

  return {
    categories,
    posts,
    replies,
    userUpvotes,
    loading,
    fetchPosts,
    fetchReplies,
    toggleUpvote
  };
};