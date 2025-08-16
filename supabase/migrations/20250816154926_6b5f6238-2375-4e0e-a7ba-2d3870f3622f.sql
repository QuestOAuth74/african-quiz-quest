-- Create feature flags table for controlling access
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  enabled_for_admins BOOLEAN NOT NULL DEFAULT true,
  enabled_for_public BOOLEAN NOT NULL DEFAULT false,
  rollout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Policies for feature flags
CREATE POLICY "Admins can manage feature flags" 
ON public.feature_flags 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view public features" 
ON public.feature_flags 
FOR SELECT 
USING (enabled_for_public = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- Create crossword words table
CREATE TABLE public.crossword_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  clue TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  length INTEGER GENERATED ALWAYS AS (char_length(word)) STORED,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crossword_words ENABLE ROW LEVEL SECURITY;

-- Policies for crossword words
CREATE POLICY "Admins can manage crossword words" 
ON public.crossword_words 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active crossword words when feature enabled" 
ON public.crossword_words 
FOR SELECT 
USING (
  is_active = true AND 
  (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.feature_flags 
      WHERE feature_name = 'crossword_puzzle' AND enabled_for_public = true
    )
  )
);

-- Create crossword puzzles table for generated puzzles
CREATE TABLE public.crossword_puzzles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  grid_data JSONB NOT NULL,
  words_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crossword_puzzles ENABLE ROW LEVEL SECURITY;

-- Policies for crossword puzzles
CREATE POLICY "Admins can manage crossword puzzles" 
ON public.crossword_puzzles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active puzzles when feature enabled" 
ON public.crossword_puzzles 
FOR SELECT 
USING (
  is_active = true AND 
  (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.feature_flags 
      WHERE feature_name = 'crossword_puzzle' AND enabled_for_public = true
    )
  )
);

-- Insert initial feature flag for crossword puzzle
INSERT INTO public.feature_flags (feature_name, enabled_for_admins, enabled_for_public)
VALUES ('crossword_puzzle', true, false);

-- Add triggers for updated_at
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crossword_words_updated_at
BEFORE UPDATE ON public.crossword_words
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crossword_puzzles_updated_at
BEFORE UPDATE ON public.crossword_puzzles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Sample African history crossword words
INSERT INTO public.crossword_words (word, clue, category, difficulty) VALUES
('MALI', 'Ancient West African empire known for its gold trade', 'Ancient Kingdoms', 2),
('TIMBUKTU', 'Famous trading city and center of learning in medieval Africa', 'Cities', 3),
('MANSA', 'Title of the ruler of the Mali Empire', 'Leaders', 2),
('NUBIA', 'Ancient kingdom located south of Egypt along the Nile', 'Ancient Kingdoms', 3),
('AXUM', 'Ancient trading kingdom in present-day Ethiopia', 'Ancient Kingdoms', 3),
('SHAKA', 'Famous Zulu king and military leader', 'Leaders', 2),
('BENIN', 'West African kingdom famous for its bronze sculptures', 'Art & Culture', 3),
('CAIRO', 'Capital city founded by the Fatimid dynasty', 'Cities', 2),
('KUSH', 'Ancient Nubian kingdom that conquered Egypt', 'Ancient Kingdoms', 2),
('YORUBA', 'Major ethnic group of West Africa with rich cultural traditions', 'Culture', 3);