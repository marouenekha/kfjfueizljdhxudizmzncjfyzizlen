-- Create jobs table for job management
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT jobs_status_check CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'refused'))
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs
CREATE POLICY "Jobs are viewable by participants" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create job requests" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participants can update jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = provider_id);

-- Create follows table for follower system
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create follows" 
ON public.follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users can delete their own follows" 
ON public.follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Add location column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add location to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Create trigger for jobs updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();