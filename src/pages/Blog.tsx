
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogData } from '@/hooks/useBlogData';
import { Search, Clock, Eye, Calendar, BookOpen, Users, TrendingUp, Sparkles, Globe, Star } from 'lucide-react';
import { format } from 'date-fns';

export const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { posts, categories, fetchPosts, loading } = useBlogData();
  const [filteredPosts, setFilteredPosts] = useState(posts);

  // Set page title and meta
  usePageMeta("Blog", "Discover articles, insights, and stories about African history, culture, and heritage on the Historia Africana blog.");

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

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-theme-brown via-theme-brown-light to-theme-brown-dark">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-theme-yellow/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-theme-yellow/20 rounded-lg rotate-45 animate-bounce delay-100"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-theme-yellow/15 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-theme-yellow/25 rounded-full animate-bounce delay-500"></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>
          
          {/* Mesh gradient effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-72 h-72 bg-theme-yellow/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-theme-yellow/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center text-white max-w-4xl mx-auto">
            {/* Modern header with icons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-3 bg-theme-yellow/20 rounded-2xl backdrop-blur-sm border border-theme-yellow/30">
                <Sparkles className="h-8 w-8 text-theme-yellow" />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-theme-yellow-light to-white bg-clip-text text-transparent">
                Historia Africana
              </h1>
              <div className="p-3 bg-theme-yellow/20 rounded-2xl backdrop-blur-sm border border-theme-yellow/30">
                <Globe className="h-8 w-8 text-theme-yellow" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-theme-yellow/20 backdrop-blur-sm rounded-full px-6 py-2 border border-theme-yellow/30 mb-6">
              <BookOpen className="h-5 w-5 text-theme-yellow" />
              <span className="text-theme-yellow font-semibold">Stories & Insights</span>
            </div>
            
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed mb-8 text-gray-100">
              Discover the untold stories, rich heritage, and remarkable civilizations that shaped 
              the African continent through centuries of history.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Users className="h-5 w-5 text-theme-yellow" />
                <span className="text-sm font-medium">Expert Writers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <TrendingUp className="h-5 w-5 text-theme-yellow" />
                <span className="text-sm font-medium">Weekly Updates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Star className="h-5 w-5 text-theme-yellow" />
                <span className="text-sm font-medium">Authentic Stories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 md:h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="hsl(var(--background))"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="hsl(var(--background))"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="hsl(var(--background))"></path>
          </svg>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Modern Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search stories, insights, and discoveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base bg-background border-2 border-border focus:border-theme-yellow"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-border focus:border-theme-yellow">
                  <SelectValue placeholder="Choose category" />
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
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-yellow/10 rounded-full mb-4">
                <div className="animate-spin h-8 w-8 border-4 border-theme-yellow border-t-transparent rounded-full"></div>
              </div>
              <p className="text-lg text-muted-foreground">Loading amazing stories...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid gap-8 md:gap-10">
              {filteredPosts.map((post, index) => (
                <article key={post.id} className={`group ${index === 0 ? 'md:col-span-2' : ''}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-theme-yellow/20 bg-gradient-to-br from-card to-card/50">
                    <div className={`grid ${post.featured_image_url ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-0`}>
                      {post.featured_image_url && (
                        <div className="relative overflow-hidden aspect-video md:aspect-square">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      
                      <div className="p-8">
                        <div className="space-y-4">
                          {post.category && (
                            <Badge variant="secondary" className="bg-theme-yellow/20 text-theme-yellow border-theme-yellow/30 hover:bg-theme-yellow/30">
                              {post.category.name}
                            </Badge>
                          )}
                          
                          <CardTitle className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-theme-yellow transition-colors duration-300">
                            <Link to={`/blog/${post.slug}`} className="block">
                              {post.title}
                            </Link>
                          </CardTitle>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(post.published_at || post.created_at), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {post.author?.display_name || 'Historia Africana'}
                            </span>
                            {post.reading_time_minutes && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {post.reading_time_minutes} min read
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-4 w-4" />
                              {post.view_count} views
                            </span>
                          </div>
                          
                          {post.excerpt && (
                            <p className="text-muted-foreground leading-relaxed text-lg">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between pt-4">
                            <Link
                              to={`/blog/${post.slug}`}
                              className="inline-flex items-center gap-2 text-theme-yellow hover:text-theme-yellow-light font-semibold group/link"
                            >
                              Continue Reading
                              <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </Link>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag.id} variant="outline" className="text-xs border-muted">
                                    #{tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/50 rounded-full mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No Stories Found</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or browse different categories to discover amazing African stories.'
                  : 'New captivating stories are coming soon! Check back for fascinating insights into African history and culture.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
