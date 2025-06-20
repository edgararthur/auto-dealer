-- Create wishlists table for the autora-buyer application
-- This table stores user wishlists with references to products

-- Create the wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_wishlists_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_wishlists_product_id 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE CASCADE,
    
    -- Ensure unique combination of user and product
    CONSTRAINT unique_user_product 
        UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_created_at ON public.wishlists(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Users can only see their own wishlist items
CREATE POLICY "Users can view own wishlist items" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own wishlist items
CREATE POLICY "Users can update own wishlist items" ON public.wishlists
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_wishlists_updated_at
    BEFORE UPDATE ON public.wishlists
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
