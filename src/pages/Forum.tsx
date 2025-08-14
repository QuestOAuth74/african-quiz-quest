import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Upload, X, Image as ImageIcon, ThumbsUp, Reply, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import ForumHeader from '@/components/forum/ForumHeader';
import { UserAvatar } from '@/components/UserAvatar';

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
    email: string;
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
    email: string;
  };
}

const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category_id: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<{ [postId: string]: Reply[] }>({});
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    if (user) {
      fetchUserUpvotes();
    }
  }, [selectedCategory, user]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories(data || []);
  };

  const fetchPosts = async () => {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        forum_categories!fk_forum_posts_category_id(name),
        profiles!fk_forum_posts_user_id(display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error('Failed to load posts');
      setLoading(false);
      return;
    }
    
    setPosts(data || []);
    setLoading(false);
  };

  const fetchUserUpvotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('forum_post_upvotes')
      .select('post_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setUserUpvotes(new Set(data.map(upvote => upvote.post_id)));
    }
  };

  const fetchReplies = async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_post_replies')
      .select(`
        *,
        profiles!fk_forum_post_replies_user_id(display_name, email)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setReplies(prev => ({ ...prev, [postId]: data }));
    }
  };

  const toggleUpvote = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to upvote posts');
      return;
    }

    const isUpvoted = userUpvotes.has(postId);

    try {
      if (isUpvoted) {
        // Remove upvote
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
        // Add upvote
        const { error } = await supabase
          .from('forum_post_upvotes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) {
          toast.error('Failed to upvote post');
          return;
        }

        setUserUpvotes(prev => new Set(prev).add(postId));
      }

      // Update post upvote count in local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, upvote_count: post.upvote_count + (isUpvoted ? -1 : 1) }
          : post
      ));

    } catch (error) {
      toast.error('Error updating upvote');
    }
  };

  const toggleReplies = async (postId: string) => {
    if (showReplies.has(postId)) {
      setShowReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setShowReplies(prev => new Set(prev).add(postId));
      if (!replies[postId]) {
        await fetchReplies(postId);
      }
    }
  };

  const submitReply = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }

    const content = replyContent[postId]?.trim();
    if (!content) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmittingReply(postId);

    try {
      const { error } = await supabase
        .from('forum_post_replies')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content
        });

      if (error) {
        toast.error('Failed to submit reply');
        return;
      }

      toast.success('Reply submitted!');
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      await fetchReplies(postId);
    } catch (error) {
      toast.error('Error submitting reply');
    } finally {
      setSubmittingReply(null);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Please select a JPG or PNG image');
      return;
    }

    // Validate file size (500KB limit)
    if (file.size > 500 * 1024) {
      toast.error('Image size must be less than 500KB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('forum-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim() || !newPost.category_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error('Failed to upload image');
          setUploading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category_id: newPost.category_id,
          user_id: user.id,
          image_url: imageUrl
        });

      if (error) {
        toast.error('Failed to create post');
        return;
      }

      toast.success('Post created successfully!');
      setNewPost({ title: '', content: '', category_id: '' });
      removeImage();
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      toast.error('Error creating post');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-8">
        <ForumHeader />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Create Post Section */}
        {isAuthenticated ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Start a Discussion
                </CardTitle>
                <Button
                  onClick={() => setShowCreatePost(!showCreatePost)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            {showCreatePost && (
              <CardContent className="space-y-4">
                <Select value={newPost.category_id} onValueChange={(value) => setNewPost({ ...newPost, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
                
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Image (Optional)</span>
                  </div>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-w-xs rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG or PNG, max 500KB
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} disabled={uploading}>
                    {uploading ? 'Creating...' : 'Post'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No posts found in this category. Be the first to start a discussion!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar 
                          displayName={post.profiles?.display_name}
                          email={post.profiles?.email}
                          size="md"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {post.profiles?.display_name || 'Anonymous User'}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{post.forum_categories.name}</Badge>
                            <span>•</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="w-full max-w-md rounded-lg border mb-4"
                    />
                  )}
                  <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                  
                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <Button
                      variant={userUpvotes.has(post.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleUpvote(post.id)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.upvote_count}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReplies(post.id)}
                      className="flex items-center gap-2"
                    >
                      <Reply className="h-4 w-4" />
                      <span>{replies[post.id]?.length || 0} Replies</span>
                    </Button>
                  </div>

                  {/* Replies Section */}
                  {showReplies.has(post.id) && (
                    <div className="mt-4 space-y-4">
                      {/* Reply Input */}
                      {isAuthenticated && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyContent[post.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ 
                              ...prev, 
                              [post.id]: e.target.value 
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitReply(post.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => submitReply(post.id)}
                            disabled={submittingReply === post.id}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Replies List */}
                      <div className="space-y-3 ml-4">
                        {replies[post.id]?.map((reply) => (
                          <div key={reply.id} className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-start gap-3">
                              <UserAvatar 
                                displayName={reply.profiles?.display_name}
                                email={reply.profiles?.email}
                                size="sm"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply.profiles?.display_name || 'Anonymous User'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!replies[post.id] || replies[post.id].length === 0) && (
                          <p className="text-sm text-muted-foreground">No replies yet. Be the first to reply!</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;