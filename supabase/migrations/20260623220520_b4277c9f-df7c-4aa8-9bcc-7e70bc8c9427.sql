
-- Add username for public store URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- Backfill usernames from name + short id suffix
UPDATE public.profiles
SET username = lower(regexp_replace(coalesce(nullif(trim(name),''), 'user'), '[^a-zA-Z0-9]+', '-', 'g'))
               || '-' || substr(user_id::text, 1, 6)
WHERE username IS NULL;

-- Trim leading/trailing dashes
UPDATE public.profiles
SET username = regexp_replace(username, '(^-+|-+$)', '', 'g')
WHERE username ~ '(^-|-$)';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username));

-- Ensure anon can read products and profiles (public store pages)
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.profiles TO anon;
