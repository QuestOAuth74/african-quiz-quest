-- Remove effective size limitations by setting large per-file limit (2GB)
UPDATE storage.buckets 
SET file_size_limit = 2147483647
WHERE id = 'presentation-files';