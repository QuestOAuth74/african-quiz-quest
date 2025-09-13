-- Create storage bucket for presentation files
INSERT INTO storage.buckets (id, name, public) VALUES ('presentation-files', 'presentation-files', false);

-- Create presentation projects table
CREATE TABLE public.presentation_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_slides INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER, -- in seconds
  audio_file_url TEXT,
  audio_file_name TEXT,
  powerpoint_file_url TEXT,
  powerpoint_file_name TEXT,
  export_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create presentation slides table
CREATE TABLE public.presentation_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.presentation_projects(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  start_time DECIMAL, -- in seconds
  end_time DECIMAL, -- in seconds
  duration DECIMAL, -- in seconds
  ai_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create presentation audio table  
CREATE TABLE public.presentation_audio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.presentation_projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  duration DECIMAL, -- in seconds
  transcript TEXT,
  waveform_data JSONB,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.presentation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_audio ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin-only access
CREATE POLICY "Admins can manage presentation projects"
ON public.presentation_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage presentation slides"
ON public.presentation_slides
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage presentation audio"
ON public.presentation_audio
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for presentation files bucket
CREATE POLICY "Admins can manage presentation files"
ON storage.objects
FOR ALL
USING (bucket_id = 'presentation-files' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'presentation-files' AND has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_presentation_projects_updated_at
  BEFORE UPDATE ON public.presentation_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presentation_slides_updated_at
  BEFORE UPDATE ON public.presentation_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presentation_audio_updated_at
  BEFORE UPDATE ON public.presentation_audio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_presentation_slides_project_id ON public.presentation_slides(project_id);
CREATE INDEX idx_presentation_slides_slide_number ON public.presentation_slides(project_id, slide_number);
CREATE INDEX idx_presentation_audio_project_id ON public.presentation_audio(project_id);