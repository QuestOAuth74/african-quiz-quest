-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 10,
  explanation TEXT,
  historical_context TEXT,
  image_url TEXT,
  has_image BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question_options table
CREATE TABLE public.question_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('correct', 'incorrect')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (admin only)
CREATE POLICY "Admin can view categories" ON public.categories FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can insert categories" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can update categories" ON public.categories FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can delete categories" ON public.categories FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for questions (admin only)
CREATE POLICY "Admin can view questions" ON public.questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can insert questions" ON public.questions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can update questions" ON public.questions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can delete questions" ON public.questions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for question_options (admin only)
CREATE POLICY "Admin can view question_options" ON public.question_options FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can insert question_options" ON public.question_options FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can update question_options" ON public.question_options FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can delete question_options" ON public.question_options FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = user_id
);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name) VALUES 
  ('Ancient History'),
  ('Medieval History'),
  ('Modern History'),
  ('World Wars'),
  ('American History');

-- Create admin function for checking admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to make user admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;