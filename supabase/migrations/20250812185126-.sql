-- Clear all posts from the database
DELETE FROM public.posts;

-- Clear all profiles from the database  
DELETE FROM public.profiles;

-- Reset the sequences if needed (optional, but good practice)
-- This ensures that new records start with clean IDs