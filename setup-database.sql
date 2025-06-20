-- AUTORA BUYER - PRODUCTION DATABASE SETUP
-- Execute this in your Supabase SQL Editor to create all missing tables and indexes

-- ==========================================
-- 1. MISSING TABLES CREATION
-- ==========================================

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

-- Create browsing_history table (updated to match schema)
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

-- ==========================================
-- 2. PERFORMANCE INDEXES
-- ==========================================

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_created_at ON public.wishlists USING btree (created_at DESC);

-- Browsing history indexes
CREATE INDEX IF NOT EXISTS idx_browsing_history_user_id ON public.browsing_history USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON public.browsing_history USING btree (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_browsing_history_product_id ON public.browsing_history USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_session ON public.browsing_history USING btree (session_id);

-- User comparison indexes
CREATE INDEX IF NOT EXISTS idx_user_comparison_user_id ON public.user_comparison USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_comparison_product_id ON public.user_comparison USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_user_comparison_added_at ON public.user_comparison USING btree (added_at DESC);

-- Saved carts indexes
CREATE INDEX IF NOT EXISTS idx_saved_carts_user_id ON public.saved_carts USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_carts_created_at ON public.saved_carts USING btree (created_at DESC);

-- Critical product performance indexes
CREATE INDEX IF NOT EXISTS idx_products_dealer_status ON public.products USING btree (dealer_id, status, is_active) WHERE status = 'approved' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_status ON public.products USING btree (category_id, status, is_active) WHERE status = 'approved' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_brand_status ON public.products USING btree (brand_id, status, is_active) WHERE status = 'approved' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_created_desc ON public.products USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products USING btree (stock_quantity) WHERE stock_quantity > 0;

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_primary ON public.product_images USING btree (product_id, is_primary);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_created ON public.cart_items USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_saved_cart ON public.cart_items USING btree (saved_cart_id) WHERE saved_cart_id IS NOT NULL;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);

-- Reviews indexes (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_reviews' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_product_reviews_product_rating ON public.product_reviews USING btree (product_id, rating);
        CREATE INDEX IF NOT EXISTS idx_product_reviews_user_created ON public.product_reviews USING btree (user_id, created_at DESC);
    END IF;
END $$;

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

-- Wishlists policies
DROP POLICY IF EXISTS "Users can view their own wishlists" ON public.wishlists;
CREATE POLICY "Users can view their own wishlists" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own wishlists" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Browsing history policies
DROP POLICY IF EXISTS "Users can view their own browsing history" ON public.browsing_history;
CREATE POLICY "Users can view their own browsing history" ON public.browsing_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own browsing history" ON public.browsing_history;
CREATE POLICY "Users can insert their own browsing history" ON public.browsing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User comparison policies
DROP POLICY IF EXISTS "Users can manage their own comparisons" ON public.user_comparison;
CREATE POLICY "Users can manage their own comparisons" ON public.user_comparison
  FOR ALL USING (auth.uid() = user_id);

-- Saved carts policies
DROP POLICY IF EXISTS "Users can manage their own saved carts" ON public.saved_carts;
CREATE POLICY "Users can manage their own saved carts" ON public.saved_carts
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 5. HELPER FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_saved_carts_updated_at ON public.saved_carts;
CREATE TRIGGER update_saved_carts_updated_at 
    BEFORE UPDATE ON public.saved_carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. ANALYTICS VIEWS (Read-only for performance)
-- ==========================================

-- Popular products view
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    COUNT(DISTINCT bh.user_id) as unique_views,
    COUNT(bh.id) as total_views,
    COUNT(DISTINCT w.user_id) as wishlist_count,
    COUNT(DISTINCT ci.user_id) as cart_adds,
    AVG(pr.rating) as avg_rating,
    COUNT(pr.id) as review_count
FROM products p
LEFT JOIN browsing_history bh ON p.id = bh.product_id
LEFT JOIN wishlists w ON p.id = w.product_id
LEFT JOIN cart_items ci ON p.id = ci.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
WHERE p.status = 'approved' AND p.is_active = true
GROUP BY p.id, p.name, p.price
ORDER BY total_views DESC, unique_views DESC;

-- User engagement view
CREATE OR REPLACE VIEW user_engagement AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT bh.product_id) as products_viewed,
    COUNT(DISTINCT w.product_id) as wishlist_items,
    COUNT(DISTINCT ci.product_id) as cart_items,
    COUNT(DISTINCT o.id) as orders_placed,
    MAX(bh.viewed_at) as last_activity
FROM auth.users u
LEFT JOIN browsing_history bh ON u.id = bh.user_id
LEFT JOIN wishlists w ON u.id = w.user_id
LEFT JOIN cart_items ci ON u.id = ci.user_id
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;

-- ==========================================
-- 7. GRANT PERMISSIONS
-- ==========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON popular_products TO authenticated;
GRANT SELECT ON user_engagement TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT, INSERT ON public.browsing_history TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_comparison TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_carts TO authenticated;

-- ==========================================
-- 8. DATA VALIDATION FUNCTIONS
-- ==========================================

-- Function to clean up old browsing history (keep only last 100 per user)
CREATE OR REPLACE FUNCTION cleanup_browsing_history()
RETURNS void AS $$
BEGIN
    DELETE FROM browsing_history
    WHERE id IN (
        SELECT id 
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY viewed_at DESC) as rn
            FROM browsing_history
        ) t 
        WHERE rn > 100
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's browsing recommendations
CREATE OR REPLACE FUNCTION get_user_recommendations(input_user_id uuid, limit_count integer DEFAULT 10)
RETURNS TABLE(product_id uuid, relevance_score numeric) AS $$
BEGIN
    RETURN QUERY
    WITH user_categories AS (
        SELECT DISTINCT p.category_id, COUNT(*) as view_count
        FROM browsing_history bh
        JOIN products p ON bh.product_id = p.id
        WHERE bh.user_id = input_user_id
        GROUP BY p.category_id
        ORDER BY view_count DESC
        LIMIT 5
    ),
    similar_users AS (
        SELECT bh2.user_id, COUNT(*) as common_views
        FROM browsing_history bh1
        JOIN browsing_history bh2 ON bh1.product_id = bh2.product_id
        WHERE bh1.user_id = input_user_id 
          AND bh2.user_id != input_user_id
        GROUP BY bh2.user_id
        ORDER BY common_views DESC
        LIMIT 10
    )
    SELECT DISTINCT 
        p.id as product_id,
        (
            CASE WHEN uc.category_id IS NOT NULL THEN 3.0 ELSE 0.0 END +
            CASE WHEN su.user_id IS NOT NULL THEN 2.0 ELSE 0.0 END +
            COALESCE(AVG(pr.rating), 0) * 0.5
        ) as relevance_score
    FROM products p
    LEFT JOIN user_categories uc ON p.category_id = uc.category_id
    LEFT JOIN similar_users su ON EXISTS (
        SELECT 1 FROM browsing_history bh 
        WHERE bh.user_id = su.user_id AND bh.product_id = p.id
    )
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.status = 'approved' 
      AND p.is_active = true
      AND p.stock_quantity > 0
      AND NOT EXISTS (
          SELECT 1 FROM browsing_history bh 
          WHERE bh.user_id = input_user_id AND bh.product_id = p.id
      )
    GROUP BY p.id, uc.category_id, su.user_id
    HAVING (
        CASE WHEN uc.category_id IS NOT NULL THEN 3.0 ELSE 0.0 END +
        CASE WHEN su.user_id IS NOT NULL THEN 2.0 ELSE 0.0 END +
        COALESCE(AVG(pr.rating), 0) * 0.5
    ) > 0
    ORDER BY relevance_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SETUP COMPLETE
-- ==========================================

-- Verify setup
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: wishlists, browsing_history, user_comparison, saved_carts';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'RLS policies configured for data security';
    RAISE NOTICE 'Helper functions and views created';
    RAISE NOTICE 'Ready for production use!';
END $$; 