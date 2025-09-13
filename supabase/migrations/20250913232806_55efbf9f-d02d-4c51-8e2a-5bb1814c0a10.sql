-- Fix presentation_audio table to allow nullable file_url
ALTER TABLE public.presentation_audio ALTER COLUMN file_url DROP NOT NULL;

-- Add progress tracking to presentation_projects
ALTER TABLE public.presentation_projects 
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS processing_error TEXT,
ADD COLUMN IF NOT EXISTS processing_log TEXT[];

-- Update the status column to include more states
ALTER TABLE public.presentation_projects 
DROP CONSTRAINT IF EXISTS presentation_projects_status_check;

ALTER TABLE public.presentation_projects 
ADD CONSTRAINT presentation_projects_status_check 
CHECK (status IN ('draft', 'processing', 'syncing', 'completed', 'error', 'ready'));

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_presentation_projects_status 
ON public.presentation_projects(status);

CREATE INDEX IF NOT EXISTS idx_presentation_projects_processing_status 
ON public.presentation_projects(processing_status);