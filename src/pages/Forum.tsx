import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForumData } from '@/hooks/useForumData';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Plus, Upload, X, Image as ImageIcon, ThumbsUp, Reply, Send, Filter, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import TopNavigation from '@/components/TopNavigation';
import ForumHeader from '@/components/forum/ForumHeader';
import ForumStats from '@/components/forum/ForumStats';
import PostSorting from '@/components/forum/PostSorting';
import SearchBar from '@/components/forum/SearchBar';
import PostFilters from '@/components/forum/PostFilters';
import BookmarkButton from '@/components/forum/BookmarkButton';
import { PrivateMessages } from '@/components/forum/PrivateMessages';
import { PostWithMessaging } from '@/components/forum/PostWithMessaging';
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
  };
}

const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Set page title
  usePageTitle("Community Forum");
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [popularityFilter, setPopularityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [postsPerPage] = useState(10);
  const [visiblePostsCount, setVisiblePostsCount] = useState(10);
  
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

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Build filters object with memoization
  const filters = useMemo(() => ({
    selectedCategory,
    searchTerm: debouncedSearchTerm,
    sortBy,
    sortOrder,
    timeFilter,
    userFilter,
    popularityFilter
  }), [selectedCategory, debouncedSearchTerm, sortBy, sortOrder, timeFilter, userFilter, popularityFilter]);

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

  // Use the bookmarks hook
  const {
    bookmarkedPosts,
    loading: bookmarksLoading,
    removeBookmark,
    isPostBookmarked,
    refetchBookmarks
  } = useBookmarks(user);

  // Reset visible posts count when filters change (with debounced search)
  useEffect(() => {
    setVisiblePostsCount(10);
  }, [selectedCategory, debouncedSearchTerm, sortBy, sortOrder, timeFilter, userFilter, popularityFilter]);

  // Calculate active filters count
  const activeFiltersCount = [
    timeFilter !== 'all',
    userFilter !== 'all',
    popularityFilter !== 'all'
  ].filter(Boolean).length;

  // Memoized filter handlers
  const handleClearFilters = useCallback(() => {
    setTimeFilter('all');
    setUserFilter('all');
    setPopularityFilter('all');
  }, []);

  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const handleShowMorePosts = useCallback(() => {
    setVisiblePostsCount(prev => prev + postsPerPage);
  }, [postsPerPage]);

  const handleShowLessPosts = useCallback(() => {
    setVisiblePostsCount(postsPerPage);
  }, [postsPerPage]);

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
        {/* Tab Navigation */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="bookmarks" disabled={!isAuthenticated}>
              Bookmarks {isAuthenticated && bookmarkedPosts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {bookmarkedPosts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6" style={{ display: 'block' }}>
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

            {/* Feed Section */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start a conversation in this category!
                  </p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </Card>
              ) : (
                <>
                  {posts.slice(0, visiblePostsCount).map((post) => (
                    <PostWithMessaging
                      key={post.id}
                      post={post}
                      isUpvoted={userUpvotes.has(post.id)}
                      onUpvote={() => toggleUpvote(post.id)}
                      onToggleReplies={() => toggleReplies(post.id)}
                      showReplies={showReplies.has(post.id)}
                      replies={replies[post.id] || []}
                      replyContent={replyContent[post.id] || ''}
                      onReplyContentChange={(content) => setReplyContent(prev => ({ ...prev, [post.id]: content }))}
                      onSubmitReply={() => submitReply(post.id)}
                      submittingReply={submittingReply === post.id}
                      formatDate={formatDate}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                  
                  {/* Show More/Less Toggle Button */}
                  {posts.length > postsPerPage && (
                    <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Showing {Math.min(visiblePostsCount, posts.length)} of {posts.length} posts
                          </div>
                          
                          <div className="flex gap-3">
                            {visiblePostsCount < posts.length && (
                              <Button
                                onClick={handleShowMorePosts}
                                variant="outline"
                                className="rounded-full px-6 h-12 font-semibold bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:bg-primary/20 transition-all duration-300"
                              >
                                <ChevronDown className="h-5 w-5 mr-2" />
                                Show Next {Math.min(postsPerPage, posts.length - visiblePostsCount)} Posts
                              </Button>
                            )}
                            
                            {visiblePostsCount > postsPerPage && (
                              <Button
                                onClick={handleShowLessPosts}
                                variant="outline"
                                className="rounded-full px-6 h-12 font-semibold border-muted-foreground/20 hover:bg-muted/20 transition-all duration-300"
                              >
                                <ChevronUp className="h-5 w-5 mr-2" />
                                Show Less
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookmarks">
            {isAuthenticated ? (
              <div className="space-y-6">
                {bookmarksLoading ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading bookmarked posts...</div>
                  </div>
                ) : bookmarkedPosts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookmarked posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Bookmark posts you want to revisit later by clicking the bookmark button.
                    </p>
                    <Button onClick={() => {
                      const postsTab = document.querySelector('[value="posts"]') as HTMLButtonElement;
                      postsTab?.click();
                    }}>
                      Browse Posts
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Your Bookmarked Posts</h2>
                      <div className="text-sm text-muted-foreground">
                        {bookmarkedPosts.length} post{bookmarkedPosts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                     {bookmarkedPosts.map((post) => (
                      <PostWithMessaging
                        key={post.id}
                        post={post}
                        isUpvoted={userUpvotes.has(post.id)}
                        showReplies={showReplies.has(post.id)}
                        replies={replies[post.id] || []}
                        replyContent={replyContent[post.id] || ''}
                        submittingReply={submittingReply === post.id}
                        onViewPost={(id) => window.location.href = `/forum/${id}`}
                        onUpvote={() => toggleUpvote(post.id)}
                        onToggleReplies={() => toggleReplies(post.id)}
                        onReplyContentChange={(content) => 
                          setReplyContent(prev => ({ ...prev, [post.id]: content }))
                        }
                        onSubmitReply={() => submitReply(post.id)}
                        formatDate={formatDate}
                        user={user}
                        isAuthenticated={isAuthenticated}
                        onBookmarkRemove={() => {
                          removeBookmark(post.id);
                          refetchBookmarks();
                        }}
                        showBookmarkedAt={true}
                        bookmarkedAt={post.bookmarked_at}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to view bookmarks</h3>
                <p className="text-muted-foreground mb-4">
                  Save posts you want to revisit later with bookmarks.
                </p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages">
            {isAuthenticated ? (
              <PrivateMessages />
            ) : (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in to access messages</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with other community members through private messages.
                </p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Forum;