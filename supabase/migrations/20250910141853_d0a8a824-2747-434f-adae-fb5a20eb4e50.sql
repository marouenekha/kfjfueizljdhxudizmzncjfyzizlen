-- Drop the posts table completely
DROP TABLE IF EXISTS public.posts CASCADE;

-- Also remove any storage bucket for posts if it exists
DELETE FROM storage.buckets WHERE id = 'posts';