-- Create blog comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for blog comments
CREATE POLICY "Anyone can view blog comments" 
ON public.blog_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.blog_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.blog_comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate comments" 
ON public.blog_comments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON public.blog_comments(parent_comment_id);
CREATE INDEX idx_blog_comments_created_at ON public.blog_comments(created_at);