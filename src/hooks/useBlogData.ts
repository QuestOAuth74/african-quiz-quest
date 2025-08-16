import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt?: string | null;
  featured_image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string[] | null;
  author_id: string;
  category_id?: string | null;
  status: string;
  published_at?: string | null;
  reading_time_minutes?: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: BlogCategory;
  author?: {
    display_name: string;
    email: string;
  };
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export const useBlogData = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async (status?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:categories(*),
          author:profiles!blog_posts_author_id_fkey(display_name, email),
          blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const postsWithTags = data?.map(post => ({
        ...post,
        author: Array.isArray(post.author) ? post.author[0] : post.author,
        tags: post.blog_post_tags?.map((pt: any) => pt.tag) || []
      })) || [];

      setPosts(postsWithTags as BlogPost[]);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tags",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createPost = async (postData: any) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePost = async (id: string, postData: any) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getPostBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:categories(*),
          author:profiles!blog_posts_author_id_fkey(display_name, email),
          blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;

      const postWithTags = {
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
        tags: data.blog_post_tags?.map((pt: any) => pt.tag) || []
      };

      return postWithTags as BlogPost;
    } catch (error: any) {
      toast({
        title: "Error fetching post",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViewCount = async (id: string) => {
    try {
      await supabase.rpc('increment_view_count', { post_id: id });
    } catch (error) {
      // Silently fail for view count increment
      console.error('Error incrementing view count:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  return {
    posts,
    categories,
    tags,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug,
    incrementViewCount,
    fetchCategories,
    fetchTags
  };
};