import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParallaxBanner } from '@/components/ParallaxBanner';
import { useBlogData } from '@/hooks/useBlogData';
import { Search, Clock, Eye, Calendar, BookOpen, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import baobabHeader from '@/assets/baobab-talks-header.png';

export const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { posts, categories, fetchPosts, loading } = useBlogData();
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    fetchPosts('published'); // Only fetch published posts for public view
  }, []);

  useEffect(() => {
    let filtered = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory]);

  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = 'Blog - Historia Africana | African History Stories & Insights';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Explore fascinating stories, insights, and knowledge about African history. Discover the rich heritage and cultural legacy of the African continent through our engaging blog posts.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Explore fascinating stories, insights, and knowledge about African history. Discover the rich heritage and cultural legacy of the African continent through our engaging blog posts.';
      document.head.appendChild(meta);
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Historia Africana Blog",
      "description": "Stories and insights about African history",
      "url": window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "Historia Africana"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup structured data on component unmount
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        if (script.textContent?.includes('Historia Africana Blog')) {
          script.remove();
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <ParallaxBanner imageSrc={baobabHeader} alt="Historia Africana Blog">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BookOpen className="h-12 w-12" />
              <h1 className="text-5xl md:text-7xl font-bold">Historia Africana</h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Blog</h2>
            <p className="text-xl md:text-2xl font-light max-w-4xl mx-auto leading-relaxed mb-6">
              Welcome to our exploration of Africa's remarkable past. Here, we share compelling narratives, 
              historical insights, and cultural discoveries that illuminate the continent's diverse heritage. 
              From ancient civilizations to modern movements, every story reveals the depth and richness 
              of African history.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Expert Historians</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>New Stories Weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Authentic Research</span>
              </div>
            </div>
          </div>
        </div>
      </ParallaxBanner>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-theme-gold border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading blog posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="space-y-2">
                        {post.category && (
                          <Badge variant="secondary">{post.category.name}</Badge>
                        )}
                        <CardTitle className="text-2xl hover:text-theme-gold transition-colors">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.published_at || post.created_at), 'MMM dd, yyyy')}
                          </span>
                          <span>By {post.author?.display_name || 'Historia Africana'}</span>
                          {post.reading_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time_minutes} min read
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.view_count} views
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    {post.excerpt && (
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="mt-4">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="text-theme-gold hover:text-theme-gold-dark font-medium inline-flex items-center gap-1"
                          >
                            Read more →
                          </Link>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                            {post.tags.map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                #{tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Check back soon for exciting new content!'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};