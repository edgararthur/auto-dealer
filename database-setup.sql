-- AUTORA BUYER - PRODUCTION DATABASE SETUP
-- Execute this in your Supabase SQL Editor

-- Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create browsing_history table
CREATE TABLE IF NOT EXISTS public.browsing_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text NULL,
  referrer text NULL,
  CONSTRAINT browsing_history_pkey PRIMARY KEY (id),
  CONSTRAINT browsing_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT browsing_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create user_comparison table
CREATE TABLE IF NOT EXISTS public.user_comparison (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_comparison_pkey PRIMARY KEY (id),
  CONSTRAINT user_comparison_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_comparison_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_comparison UNIQUE (user_id, product_id)
);

-- Create saved_carts table
CREATE TABLE IF NOT EXISTS public.saved_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Saved Cart',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_carts_pkey PRIMARY KEY (id),
  CONSTRAINT saved_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_user_id ON public.browsing_history USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_comparison_user_id ON public.user_comparison USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_carts_user_id ON public.saved_carts USING btree (user_id);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own browsing history" ON public.browsing_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert browsing history" ON public.browsing_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own comparisons" ON public.user_comparison FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own saved carts" ON public.saved_carts FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT, INSERT ON public.browsing_history TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_comparison TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_carts TO authenticated; 