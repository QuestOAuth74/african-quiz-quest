-- Create pharaoh timeline table
CREATE TABLE public.pharaoh_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dynasty TEXT NOT NULL,
  period TEXT NOT NULL,
  reign_start INTEGER,
  reign_end INTEGER,
  achievements TEXT,
  significance TEXT,
  burial_location TEXT,
  image_url TEXT,
  image_caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.pharaoh_timeline ENABLE ROW LEVEL SECURITY;

-- Anyone can view active pharaohs
CREATE POLICY "Anyone can view active pharaohs"
ON public.pharaoh_timeline
FOR SELECT
USING (is_active = true);

-- Admins can manage all pharaohs
CREATE POLICY "Admins can manage pharaohs"
ON public.pharaoh_timeline
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for sorting
CREATE INDEX idx_pharaoh_timeline_sort_order ON public.pharaoh_timeline(sort_order, reign_start);

-- Create storage bucket for pharaoh images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pharaoh-images', 'pharaoh-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pharaoh images
CREATE POLICY "Anyone can view pharaoh images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pharaoh-images');

CREATE POLICY "Admins can upload pharaoh images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pharaoh-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update pharaoh images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pharaoh-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete pharaoh images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pharaoh-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_pharaoh_timeline_updated_at
BEFORE UPDATE ON public.pharaoh_timeline
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();