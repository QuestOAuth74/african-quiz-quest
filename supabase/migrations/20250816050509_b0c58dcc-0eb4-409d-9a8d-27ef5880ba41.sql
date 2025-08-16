-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  author_id UUID NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  reading_time_minutes INTEGER,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog post tags junction table
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories
CREATE POLICY "Anyone can view blog categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog categories" 
ON public.blog_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for blog_tags
CREATE POLICY "Anyone can view blog tags" 
ON public.blog_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog tags" 
ON public.blog_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for blog_post_tags
CREATE POLICY "Anyone can view blog post tags" 
ON public.blog_post_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blog post tags" 
ON public.blog_post_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);

-- Create function to update timestamps
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-generate slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'))) 
         || '-' || EXTRACT(epoch FROM now())::text;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content JSONB)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Extract text content from JSONB and count words
  word_count := array_length(string_to_array(regexp_replace(content::text, '[^a-zA-Z\s]', ' ', 'g'), ' '), 1);
  -- Average reading speed: 200 words per minute
  reading_time := GREATEST(1, CEIL(word_count / 200.0));
  RETURN reading_time;
END;
$$ LANGUAGE plpgsql;