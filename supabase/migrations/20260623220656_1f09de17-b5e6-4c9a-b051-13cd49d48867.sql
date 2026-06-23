
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_name text;
  base_slug text;
  final_slug text;
  suffix int := 0;
BEGIN
  base_name := COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', '');
  base_slug := lower(regexp_replace(COALESCE(NULLIF(trim(base_name), ''), 'user'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '(^-+|-+$)', '', 'g');
  IF base_slug = '' THEN base_slug := 'user'; END IF;
  final_slug := base_slug || '-' || substr(NEW.id::text, 1, 6);

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(final_slug)) LOOP
    suffix := suffix + 1;
    final_slug := base_slug || '-' || substr(NEW.id::text, 1, 6) || '-' || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (user_id, name, is_provider, verified, username)
  VALUES (
    NEW.id,
    base_name,
    COALESCE((NEW.raw_user_meta_data ->> 'is_provider')::boolean, false),
    false,
    final_slug
  );

  RETURN NEW;
END;
$function$;
