-- Add Word document support to presentation projects
ALTER TABLE public.presentation_projects 
ADD COLUMN document_file_url TEXT,
ADD COLUMN document_file_name TEXT;