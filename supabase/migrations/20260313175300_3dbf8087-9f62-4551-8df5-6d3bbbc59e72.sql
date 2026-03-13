
ALTER TABLE public.posts 
ADD COLUMN shared_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL DEFAULT NULL,
ADD COLUMN original_user_id uuid DEFAULT NULL,
ADD COLUMN original_user_name text DEFAULT NULL,
ADD COLUMN original_user_avatar text DEFAULT NULL;
