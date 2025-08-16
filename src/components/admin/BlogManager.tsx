import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useBlogData, BlogPost } from '@/hooks/useBlogData';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const BlogManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { user } = useAuth();
  
  const {
    posts,
    categories,
    tags,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  } = useBlogData();

  useEffect(() => {
    fetchPosts(); // Fetch all posts for admin
  }, []);

  const handleCreatePost = async (postData: Partial<BlogPost>) => {
    if (!user) return;
    
    try {
      await createPost({
        ...postData,
        author_id: user.id
      });
      setView('list');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async (postData: Partial<BlogPost>) => {
    if (!selectedPost) return;
    
    try {
      await updatePost(selectedPost.id, postData);
      setView('list');
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost(id);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedPost(null);
  };

  if (view === 'create') {
    return (
      <BlogEditor
        categories={categories}
        tags={tags}
        onSave={handleCreatePost}
        onCancel={handleCancel}
      />
    );
  }

  if (view === 'edit' && selectedPost) {
    return (
      <BlogEditor
        post={selectedPost}
        categories={categories}
        tags={tags}
        onSave={handleUpdatePost}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Button onClick={() => setView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading posts...</div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>By {post.author?.display_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                      {post.reading_time_minutes && (
                        <>
                          <span>•</span>
                          <span>{post.reading_time_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant={
                        post.status === 'published' ? 'default' :
                        post.status === 'draft' ? 'secondary' : 'outline'
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {post.excerpt && (
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {post.category && (
                        <span>Category: {post.category.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count} views
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No blog posts found. Create your first post to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
};