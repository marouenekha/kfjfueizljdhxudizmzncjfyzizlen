
-- Create portfolio_items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  video_url TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Portfolio items are viewable by everyone" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Users can create their own portfolio items" ON public.portfolio_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio items" ON public.portfolio_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio items" ON public.portfolio_items FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
