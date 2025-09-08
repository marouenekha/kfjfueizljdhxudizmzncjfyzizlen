-- Add foreign key from posts.user_id to profiles.user_id to enable PostgREST embeddings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE public.posts
    ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index to improve join performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
