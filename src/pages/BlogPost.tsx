import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogData, BlogPost as BlogPostType } from '@/hooks/useBlogData';
import { Calendar, Clock, Eye, ArrowLeft, Share2, Facebook, Twitter, File } from 'lucide-react';
import { format } from 'date-fns';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPostBySlug, incrementViewCount } = useBlogData();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const postData = await getPostBySlug(slug);
        setPost(postData);
        
        // Increment view count
        await incrementViewCount(postData.id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Set dynamic meta tags for SEO
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.title} - Historia Africana`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = post.meta_description || post.excerpt || `Read about ${post.title} on Historia Africana blog.`;
      
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }

      // Add Open Graph tags
      const updateOrCreateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
        }
      };

      updateOrCreateMetaTag('og:title', post.title);
      updateOrCreateMetaTag('og:description', description);
      updateOrCreateMetaTag('og:type', 'article');
      updateOrCreateMetaTag('og:url', window.location.href);
      if (post.featured_image_url) {
        updateOrCreateMetaTag('og:image', post.featured_image_url);
      }

      // Add Twitter Card tags
      const updateOrCreateTwitterTag = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
        }
      };

      updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
      updateOrCreateTwitterTag('twitter:title', post.title);
      updateOrCreateTwitterTag('twitter:description', description);
      if (post.featured_image_url) {
        updateOrCreateTwitterTag('twitter:image', post.featured_image_url);
      }

      // Add structured data for article
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": description,
        "image": post.featured_image_url,
        "author": {
          "@type": "Person",
          "name": post.author?.display_name || "Historia Africana"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Historia Africana"
        },
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at,
        "wordCount": post.reading_time_minutes ? post.reading_time_minutes * 200 : undefined,
        "keywords": post.keywords?.join(', '),
        "articleSection": post.category?.name
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        // Cleanup structured data on component unmount
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          if (script.textContent?.includes(post.title)) {
            script.remove();
          }
        });
      };
    }
  }, [post]);

  const renderContentBlock = (block: any) => {
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeaderTag
            key={block.id}
            className={`font-bold leading-tight ${
              block.data.level === 1 ? 'text-3xl mt-8 mb-4' :
              block.data.level === 2 ? 'text-2xl mt-6 mb-3' :
              'text-xl mt-4 mb-2'
            }`}
          >
            {block.data.text}
          </HeaderTag>
        );

      case 'paragraph':
        return (
          <p key={block.id} className="text-foreground leading-relaxed mb-4">
            {block.data.text}
          </p>
        );

      case 'image':
        return (
          <figure key={block.id} className="my-6">
            <img
              src={block.data.url}
              alt={block.data.caption || ''}
              className="w-full rounded-lg shadow-md"
            />
            {block.data.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'youtube':
        const getYouTubeId = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          return match && match[2].length === 11 ? match[2] : null;
        };

        const videoId = getYouTubeId(block.data.url);
        
        return (
          <figure key={block.id} className="my-6">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={block.data.caption || 'YouTube video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
            {block.data.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'link':
        return (
          <div key={block.id} className="my-4">
            <a
              href={block.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-gold hover:text-theme-gold-dark underline font-medium block"
            >
              {block.data.text || block.data.url}
            </a>
            {block.data.description && (
              <p className="text-sm text-muted-foreground mt-1">{block.data.description}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={block.id} className="my-4">
            <div className="border rounded-lg p-4 flex items-center gap-3">
              <File className="h-5 w-5 text-theme-gold" />
              <div className="flex-1">
                <p className="font-medium">{block.data.name}</p>
                <p className="text-sm text-muted-foreground">{block.data.type}</p>
              </div>
              <a
                href={block.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-gold hover:text-theme-gold-dark font-medium"
              >
                Download
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sharePost = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-theme-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'The blog post you are looking for does not exist.'}
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-theme-gold text-theme-dark py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-theme-dark hover:opacity-80 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            
            <div className="space-y-4">
              {post.category && (
                <Badge variant="secondary">{post.category.name}</Badge>
              )}
              
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.published_at || post.created_at), 'MMMM dd, yyyy')}
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
                  {post.view_count + 1} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-8">
              {/* Content Blocks */}
              <div className="prose prose-lg max-w-none">
                {post.content.blocks?.map(renderContentBlock)}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Share this post</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sharePost('facebook')}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sharePost('twitter')}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sharePost('copy')}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Blog */}
          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                More Blog Posts
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </article>
  );
};