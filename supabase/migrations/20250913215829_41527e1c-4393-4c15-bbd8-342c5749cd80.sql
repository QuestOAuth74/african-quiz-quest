-- Update storage configuration for presentation files to allow 100MB uploads
-- Note: This updates the bucket configuration to allow larger files

-- Check current presentation-files bucket settings
SELECT * FROM storage.buckets WHERE id = 'presentation-files';

-- Update the file_size_limit for presentation-files bucket (100MB = 104857600 bytes)
UPDATE storage.buckets 
SET file_size_limit = 104857600
WHERE id = 'presentation-files';