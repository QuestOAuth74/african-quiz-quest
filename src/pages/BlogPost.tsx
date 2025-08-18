import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageTitle';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BlogCategoriesSidebar } from '@/components/blog/BlogCategoriesSidebar';
import { useBlogData, BlogPost as BlogPostType } from '@/hooks/useBlogData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Eye, ArrowLeft, Share2, Facebook, Twitter, File, LogIn, Quote, AlertCircle, CheckCircle, AlertTriangle, Info, Lightbulb, Hash } from 'lucide-react';
import { format } from 'date-fns';
import baobabHeader from '@/assets/baobab-talks-header.png';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdfUrl, setGeneratingPdfUrl] = useState(false);
  const { getPostBySlug, incrementViewCount } = useBlogData();
  const { user, isAuthenticated } = useAuth();

  // Set dynamic page title with loading state
  usePageMeta(
    post?.title || "Blog Post", 
    post?.meta_description || post?.excerpt || "Read this article on Historia Africana",
    { loading, loadingTitle: "Loading Article" }
  );
  
  // Function to generate a signed URL for PDF download
  const generatePdfUrl = async (pdfPath: string) => {
    if (!isAuthenticated || !pdfPath) return null;
    
    setGeneratingPdfUrl(true);
    try {
      const { data, error } = await supabase.storage
        .from('blog-pdfs')
        .createSignedUrl(pdfPath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating PDF URL:', error);
      return null;
    } finally {
      setGeneratingPdfUrl(false);
    }
  };

  // Generate PDF URL when user authenticates and PDF exists
  useEffect(() => {
    if (isAuthenticated && post?.pdf_attachment_url && !pdfUrl) {
      generatePdfUrl(post.pdf_attachment_url).then(setPdfUrl);
    }
  }, [isAuthenticated, post?.pdf_attachment_url, pdfUrl]);

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
      case 'heading':
        const HeaderTag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
        const getHeadingStyles = (level: number) => {
          switch (level) {
            case 1:
              return 'text-3xl mt-8 mb-4 p-6 rounded-lg bg-gradient-to-r from-primary/20 via-theme-gold/10 to-primary/20 border-l-4 border-theme-gold relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-theme-gold/5 before:to-transparent before:animate-pulse';
            case 2:
              return 'text-2xl mt-6 mb-3 p-4 rounded-lg bg-gradient-to-r from-accent/15 via-muted/30 to-accent/15 border-l-4 border-accent shadow-sm';
            case 3:
              return 'text-xl mt-4 mb-2 p-3 rounded-md bg-gradient-to-r from-muted/40 to-muted/20 border-l-3 border-muted-foreground/30';
            default:
              return 'text-2xl mt-6 mb-3 p-4 rounded-lg bg-gradient-to-r from-accent/15 via-muted/30 to-accent/15 border-l-4 border-accent shadow-sm';
          }
        };
        
        return React.createElement(
          HeaderTag,
          {
            key: block.id,
            className: `font-bold leading-tight text-foreground ${getHeadingStyles(block.data.level || 2)}`
          },
          block.data.text
        );

      case 'paragraph':
        // Strip HTML tags and render clean text
        const cleanText = block.data.text?.replace(/<[^>]*>/g, '') || '';
        return (
          <p key={block.id} className="text-foreground leading-relaxed mb-4">
            {cleanText}
          </p>
        );

      case 'image':
        return (
          <figure key={block.id} className="my-8">
            <div className="blog-image-frame relative p-2 rounded-xl bg-gradient-to-br from-theme-gold/20 via-theme-gold/10 to-theme-gold/20 border border-theme-gold/30 shadow-lg">
              <img
                src={block.data.url}
                alt={block.data.caption || ''}
                className="w-full rounded-lg shadow-xl relative z-10"
              />
              <div className="absolute inset-0 rounded-xl border-2 border-theme-gold/50 animate-pulse-gold"></div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-theme-gold/10 to-transparent animate-shimmer"></div>
            </div>
            {block.data.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-3 italic">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'video':
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

      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 border-theme-gold pl-6 py-4 bg-muted/30 rounded-r-lg my-6">
            <Quote className="h-6 w-6 text-theme-gold mb-2" />
            <p className="text-lg italic font-medium leading-relaxed">
              "{block.data.text}"
            </p>
            {(block.data.author || block.data.source) && (
              <footer className="mt-3 text-sm text-muted-foreground">
                {block.data.author && <cite>— {block.data.author}</cite>}
                {block.data.source && (
                  <span>
                    {block.data.author ? ', ' : '— '}
                    {block.data.source}
                  </span>
                )}
              </footer>
            )}
          </blockquote>
        );

      case 'list':
        const ListTag = block.data.listType === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag key={block.id} className={`my-4 space-y-2 ${block.data.listType === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside`}>
            {block.data.items?.map((item: string, index: number) => (
              <li key={index} className="text-foreground leading-relaxed">
                {item}
              </li>
            ))}
          </ListTag>
        );

      case 'callout':
        const getCalloutIcon = (type: string) => {
          switch (type) {
            case 'info': return Info;
            case 'warning': return AlertTriangle;
            case 'success': return CheckCircle;
            case 'error': return AlertCircle;
            case 'tip': return Lightbulb;
            default: return Info;
          }
        };

        const getCalloutStyles = (type: string) => {
          switch (type) {
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200';
            case 'success': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200';
            case 'error': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200';
            case 'tip': return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-200';
            default: return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200';
          }
        };

        const CalloutIcon = getCalloutIcon(block.data.calloutType || 'info');
        
        return (
          <div key={block.id} className={`my-6 p-4 rounded-lg border-l-4 ${getCalloutStyles(block.data.calloutType || 'info')}`}>
            <div className="flex items-start gap-3">
              <CalloutIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {block.data.title && (
                  <h4 className="font-semibold mb-2">{block.data.title}</h4>
                )}
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: block.data.content || '' }} />
              </div>
            </div>
          </div>
        );

      case 'code':
        return (
          <div key={block.id} className="my-6">
            <div className="bg-muted rounded-lg border">
              {(block.data.language || block.data.filename) && (
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 rounded-t-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    {block.data.language && <span>{block.data.language}</span>}
                    {block.data.filename && <span>{block.data.filename}</span>}
                  </div>
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono">{block.data.code}</code>
              </pre>
            </div>
          </div>
        );

      case 'divider':
        const getDividerElement = (style: string) => {
          switch (style) {
            case 'stars':
              return (
                <div className="text-center text-2xl text-muted-foreground">
                  ✦ ✦ ✦
                </div>
              );
            case 'dashed':
              return <hr className="border-dashed border-muted-foreground/30" />;
            case 'dotted':
              return <hr className="border-dotted border-muted-foreground/30" />;
            case 'double':
              return <hr className="border-double border-2 border-muted-foreground/30" />;
            case 'thick':
              return <hr className="border-2 border-muted-foreground/30" />;
            case 'gradient':
              return <hr className="h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent border-0" />;
            default:
              return <hr className="border-muted-foreground/30" />;
          }
        };

        return (
          <div key={block.id} className="my-8">
            {getDividerElement(block.data.dividerStyle || 'solid')}
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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <BlogCategoriesSidebar currentCategory={post?.category_id} />
        
        <article className="flex-1">
      {/* Modern Hero Section */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${post.featured_image_url || baobabHeader})`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-fade-in" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-700" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Back Button */}
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover-scale group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="story-link">Back to Blog</span>
            </Link>
            
            {/* Category Badge */}
            {post.category && (
              <div className="animate-fade-in delay-300">
                <Badge 
                  variant="outline" 
                  className="border-primary/30 text-primary bg-primary/10 backdrop-blur-sm hover-scale"
                >
                  {post.category.name}
                </Badge>
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground animate-fade-in delay-500">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in delay-700">
              <span className="flex items-center gap-2 hover-scale">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at || post.created_at), 'MMMM dd, yyyy')}
              </span>
              <span className="hover-scale">
                By {post.author?.display_name || 'Historia Africana'}
              </span>
              {post.reading_time_minutes && (
                <span className="flex items-center gap-2 hover-scale">
                  <Clock className="h-4 w-4" />
                  {post.reading_time_minutes} min read
                </span>
              )}
              <span className="flex items-center gap-2 hover-scale">
                <Eye className="h-4 w-4" />
                {post.view_count + 1} views
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

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

              {/* Bibliography Section */}
              {post.bibliography && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">References</h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-accent">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                        {post.bibliography}
                      </pre>
                    </div>
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

          {/* PDF Attachment - Prominently displayed at bottom */}
          {post.pdf_attachment_url && (
            <Card className="mt-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <File className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Downloadable Resource
                    </h3>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      {post.pdf_attachment_name}
                    </p>
                    <p className="text-muted-foreground">PDF Document</p>
                  </div>
                  
                  {isAuthenticated ? (
                    <Button
                      onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
                      size="lg"
                      disabled={generatingPdfUrl || !pdfUrl}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
                    >
                      <File className="h-5 w-5 mr-3" />
                      {generatingPdfUrl ? 'Preparing Download...' : 'Download PDF'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <p className="text-foreground font-medium mb-2">Sign in required</p>
                        <p className="text-muted-foreground text-sm">
                          Please sign in to access this downloadable resource.
                        </p>
                      </div>
                      <Link to="/auth">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold"
                        >
                          <LogIn className="h-5 w-5 mr-3" />
                          Sign In to Download
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
      </div>
    </SidebarProvider>
  );
};