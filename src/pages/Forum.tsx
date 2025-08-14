import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForumData } from '@/hooks/useForumData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Upload, X, Image as ImageIcon, ThumbsUp, Reply, Send, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import ForumHeader from '@/components/forum/ForumHeader';
import ForumStats from '@/components/forum/ForumStats';
import PostSorting from '@/components/forum/PostSorting';
import SearchBar from '@/components/forum/SearchBar';
import PostFilters from '@/components/forum/PostFilters';
import BookmarkButton from '@/components/forum/BookmarkButton';
import { UserAvatar } from '@/components/UserAvatar';
import { UserBadges } from '@/components/UserBadges';

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
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Post creation states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category_id: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Reply states
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  // Build filters object
  const filters = {
    selectedCategory,
    searchTerm,
    sortBy,
    sortOrder,
    timeFilter,
    userFilter,
    popularityFilter
  };

  // Use the custom hook for forum data
  const {
    categories,
    posts,
    replies,
    userUpvotes,
    loading,
    fetchPosts,
    fetchReplies,
    toggleUpvote
  } = useForumData(user, filters);

  // Calculate active filters count
  const activeFiltersCount = [
    timeFilter !== 'all',
    userFilter !== 'all',
    popularityFilter !== 'all'
  ].filter(Boolean).length;

  // Filter handlers
  const handleClearFilters = () => {
    setTimeFilter('all');
    setUserFilter('all');
    setPopularityFilter('all');
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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

      toast.success('Reply submitted! It will be visible once approved by a moderator.');
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

      toast.success('Post created successfully! It will be visible once approved by a moderator.');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <TopNavigation />
      
      {/* Modern Header Section */}
      <div className="relative">
        <ForumHeader />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {/* Stories-like Category Filter */}
        <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-border/30 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Explore Topics</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl transition-all duration-300 ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-muted/50 hover:bg-muted hover:scale-105'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedCategory === 'all' ? 'bg-background/20' : 'bg-primary/10'
              }`}>
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-center">All</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : 'bg-muted/50 hover:bg-muted hover:scale-105'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedCategory === category.id ? 'bg-background/20' : 'bg-primary/10'
                }`}>
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center line-clamp-2">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search, Sort, and Filter Section */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search discussions by title or content..."
          />
          
          {/* Sorting and Filter Toggle */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <PostSorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSortBy}
              onOrderChange={handleSortOrderChange}
            />
            
            <div className="flex items-center gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <PostFilters
              timeFilter={timeFilter}
              userFilter={userFilter}
              popularityFilter={popularityFilter}
              onTimeFilterChange={setTimeFilter}
              onUserFilterChange={setUserFilter}
              onPopularityFilterChange={setPopularityFilter}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          )}
          
          {/* Forum Statistics */}
          <ForumStats selectedCategory={selectedCategory} />
        </div>

        {/* Instagram-style Create Post Section */}
        {isAuthenticated ? (
          <Card className="mb-8 border-0 shadow-2xl bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <CardHeader className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      Share Your Story
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">What's on your mind about African history?</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCreatePost(!showCreatePost)}
                  className={`rounded-full px-6 h-12 font-semibold transition-all duration-300 shadow-lg ${
                    showCreatePost 
                      ? 'bg-muted text-muted-foreground hover:bg-muted/80 shadow-none' 
                      : 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {showCreatePost ? 'Cancel' : 'Create Post'}
                </Button>
              </div>
            </CardHeader>
            {showCreatePost && (
              <CardContent className="px-6 pb-6 space-y-6 animate-fade-in">
                <Select value={newPost.category_id} onValueChange={(value) => setNewPost({ ...newPost, category_id: value })}>
                  <SelectTrigger className="rounded-xl border-border/30 bg-background/50 h-12">
                    <SelectValue placeholder="Choose a category" />
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
                  placeholder="What's your story about?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="rounded-xl border-border/30 bg-background/50 h-12 text-base"
                />
                
                <Textarea
                  placeholder="Share your thoughts, discoveries, or questions about African heritage..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="rounded-xl border-border/30 bg-background/50 text-base resize-none"
                />
                
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Add Image</span>
                  </div>
                  
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-w-sm rounded-2xl border-2 border-border/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-3 right-3 rounded-full w-8 h-8 p-0"
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
                        className="rounded-xl border-2 border-dashed border-border/30 bg-background/50 hover:bg-background/80 h-24 w-full flex flex-col gap-2"
                      >
                        <Upload className="h-6 w-6" />
                        <span className="font-medium">Choose Image</span>
                        <span className="text-xs text-muted-foreground">JPG or PNG, max 500KB</span>
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-border/20">
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={uploading}
                    className="flex-1 rounded-xl h-12 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all duration-300"
                  >
                    {uploading ? 'Sharing...' : 'Share Post'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreatePost(false)}
                    className="rounded-xl h-12 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ) : (
          <Card className="mb-8 border-0 shadow-2xl bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
              <p className="text-muted-foreground mb-6">Sign in to share your stories and connect with the community</p>
              <Link to="/auth">
                <Button className="rounded-full px-8 h-12 font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Instagram-like Posts Feed */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <Card className="border-0 bg-background/60 backdrop-blur-xl rounded-3xl shadow-2xl">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No posts yet</h3>
                <p className="text-muted-foreground text-lg">Be the first to share something amazing!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="border-0 bg-background/80 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden animate-fade-in">
                {/* Post Header - Instagram Style */}
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <UserAvatar 
                          displayName={post.profiles?.display_name}
                          email={post.profiles?.email}
                          size="lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-background rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-lg">
                            {post.profiles?.display_name || 'Anonymous User'}
                          </span>
                          <UserBadges userId={post.user_id} limit={2} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="px-2 py-0.5 text-xs rounded-full border-primary/20 bg-primary/5">
                            {post.forum_categories.name}
                          </Badge>
                          <span>•</span>
                          <span className="text-xs">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <BookmarkButton postId={post.id} size="sm" />
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  {/* Post Title */}
                  <h2 className="text-xl font-bold text-foreground mb-4 leading-relaxed group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h2>

                  {/* Post Image - Full width like Instagram */}
                  {post.image_url && (
                    <div className="relative -mx-6 mb-6">
                      <img 
                        src={post.image_url} 
                        alt="Post image" 
                        className="w-full h-auto max-h-[500px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="space-y-4">
                    <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Engagement Actions - Instagram Style */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUpvote(post.id)}
                          className={`p-2 h-auto hover:scale-110 transition-transform duration-200 ${
                            userUpvotes.has(post.id) 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        >
                          <ThumbsUp className={`h-6 w-6 ${userUpvotes.has(post.id) ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReplies(post.id)}
                          className="p-2 h-auto text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200"
                        >
                          <Reply className="h-6 w-6" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{post.upvote_count}</span> likes
                        {replies[post.id] && replies[post.id].length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-medium">{replies[post.id].length}</span> comments
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comments Section - Instagram Style */}
                  {showReplies.has(post.id) && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      {/* Comment Input */}
                      {isAuthenticated && (
                        <div className="flex gap-3 p-4 bg-muted/30 rounded-2xl border border-border/30">
                          <UserAvatar 
                            displayName={user?.email}
                            email={user?.email || ''}
                            size="sm"
                          />
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Add a comment..."
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
                              className="border-0 bg-background/50 rounded-xl focus:bg-background"
                            />
                            <Button
                              size="sm"
                              onClick={() => submitReply(post.id)}
                              disabled={submittingReply === post.id}
                              className="rounded-xl px-4"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-4">
                        {replies[post.id]?.map((reply, index) => (
                          <div key={reply.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <UserAvatar 
                              displayName={reply.profiles?.display_name}
                              email={reply.profiles?.email}
                              size="sm"
                            />
                            <div className="flex-1">
                              <div className="bg-muted/30 rounded-2xl px-4 py-3 border border-border/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-foreground text-sm">
                                    {reply.profiles?.display_name || 'Anonymous User'}
                                  </span>
                                  <UserBadges userId={reply.user_id} limit={1} size="sm" />
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!replies[post.id] || replies[post.id].length === 0) && (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 bg-muted/30 rounded-full flex items-center justify-center">
                              <Reply className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                          </div>
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