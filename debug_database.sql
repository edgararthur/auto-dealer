-- Debug script to check database structure
-- Run this in your Supabase SQL Editor to see what tables exist

-- 1. Check if wishlists table exists
SELECT 
    table_name, 
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wishlists', 'products', 'categories', 'brands');

-- 2. Check products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if wishlists table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'wishlists' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('wishlists', 'products'); 