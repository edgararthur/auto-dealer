-- Missing Tables for Autora-Buyer Application
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create index for wishlist queries
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON public.wishlists USING btree (user_id);
CREATE INDEX IF NOT EXISTS wishlists_product_id_idx ON public.wishlists USING btree (product_id);

-- 2. Create browsing_history table
CREATE TABLE IF NOT EXISTS public.browsing_history (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text NULL,
  referrer text NULL,
  CONSTRAINT browsing_history_pkey PRIMARY KEY (id),
  CONSTRAINT browsing_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT browsing_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for browsing history
CREATE INDEX IF NOT EXISTS browsing_history_user_id_idx ON public.browsing_history USING btree (user_id);
CREATE INDEX IF NOT EXISTS browsing_history_viewed_at_idx ON public.browsing_history USING btree (viewed_at DESC);
CREATE INDEX IF NOT EXISTS browsing_history_product_id_idx ON public.browsing_history USING btree (product_id);

-- 3. Create user_comparison table
CREATE TABLE IF NOT EXISTS public.user_comparison (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_comparison_pkey PRIMARY KEY (id),
  CONSTRAINT user_comparison_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_comparison_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_comparison UNIQUE (user_id, product_id)
);

-- Create indexes for user comparison
CREATE INDEX IF NOT EXISTS user_comparison_user_id_idx ON public.user_comparison USING btree (user_id);
CREATE INDEX IF NOT EXISTS user_comparison_product_id_idx ON public.user_comparison USING btree (product_id);

-- 4. Create maintenance_reminders table
CREATE TABLE IF NOT EXISTS public.maintenance_reminders (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  vehicle_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  due_date date NOT NULL,
  due_mileage integer NULL,
  reminder_type text NOT NULL DEFAULT 'general', -- 'oil_change', 'tire_rotation', 'inspection', 'general'
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT maintenance_reminders_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  CONSTRAINT maintenance_reminder_type_check CHECK (
    reminder_type = ANY (
      ARRAY['oil_change'::text, 'tire_rotation'::text, 'inspection'::text, 'brake_service'::text, 'general'::text]
    )
  )
);

-- Create indexes for maintenance reminders
CREATE INDEX IF NOT EXISTS maintenance_reminders_user_id_idx ON public.maintenance_reminders USING btree (user_id);
CREATE INDEX IF NOT EXISTS maintenance_reminders_due_date_idx ON public.maintenance_reminders USING btree (due_date);
CREATE INDEX IF NOT EXISTS maintenance_reminders_vehicle_id_idx ON public.maintenance_reminders USING btree (vehicle_id);

-- 5. Create vehicles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  vin text NULL,
  license_plate text NULL,
  color text NULL,
  mileage integer NULL DEFAULT 0,
  engine_size text NULL,
  fuel_type text NULL DEFAULT 'gasoline',
  transmission text NULL DEFAULT 'automatic',
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT vehicles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT vehicles_year_check CHECK (year >= 1900 AND year <= extract(year from now()) + 2),
  CONSTRAINT vehicles_mileage_check CHECK (mileage >= 0),
  CONSTRAINT vehicles_fuel_type_check CHECK (
    fuel_type = ANY (
      ARRAY['gasoline'::text, 'diesel'::text, 'electric'::text, 'hybrid'::text, 'other'::text]
    )
  ),
  CONSTRAINT vehicles_transmission_check CHECK (
    transmission = ANY (
      ARRAY['manual'::text, 'automatic'::text, 'cvt'::text, 'other'::text]
    )
  )
);

-- Create indexes for vehicles
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON public.vehicles USING btree (user_id);
CREATE INDEX IF NOT EXISTS vehicles_make_model_idx ON public.vehicles USING btree (make, model);
CREATE INDEX IF NOT EXISTS vehicles_year_idx ON public.vehicles USING btree (year);

-- 6. Add missing column to cart_items table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'saved_cart_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cart_items 
        ADD COLUMN saved_cart_id uuid NULL;
        
        -- Add foreign key constraint if saved_carts table exists
        -- (uncomment if you have a saved_carts table)
        -- ALTER TABLE public.cart_items 
        -- ADD CONSTRAINT cart_items_saved_cart_id_fkey 
        -- FOREIGN KEY (saved_cart_id) REFERENCES saved_carts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. Create saved_carts table (optional, for saving cart state)
CREATE TABLE IF NOT EXISTS public.saved_carts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Saved Cart',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_carts_pkey PRIMARY KEY (id),
  CONSTRAINT saved_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for saved carts
CREATE INDEX IF NOT EXISTS saved_carts_user_id_idx ON public.saved_carts USING btree (user_id);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for user data access
-- Wishlists policies
CREATE POLICY "Users can view their own wishlists" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Browsing history policies
CREATE POLICY "Users can view their own browsing history" ON public.browsing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own browsing history" ON public.browsing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User comparison policies
CREATE POLICY "Users can view their own comparisons" ON public.user_comparison
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparisons" ON public.user_comparison
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons" ON public.user_comparison
  FOR DELETE USING (auth.uid() = user_id);

-- Maintenance reminders policies
CREATE POLICY "Users can view their own maintenance reminders" ON public.maintenance_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance reminders" ON public.maintenance_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance reminders" ON public.maintenance_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance reminders" ON public.maintenance_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Vehicles policies
CREATE POLICY "Users can view their own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Saved carts policies
CREATE POLICY "Users can view their own saved carts" ON public.saved_carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved carts" ON public.saved_carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved carts" ON public.saved_carts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved carts" ON public.saved_carts
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create triggers for updated_at
CREATE TRIGGER update_maintenance_reminders_updated_at 
    BEFORE UPDATE ON public.maintenance_reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON public.vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_carts_updated_at 
    BEFORE UPDATE ON public.saved_carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant specific permissions for these new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT, INSERT ON public.browsing_history TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_comparison TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_carts TO authenticated; 