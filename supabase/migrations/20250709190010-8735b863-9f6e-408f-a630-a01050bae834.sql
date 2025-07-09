-- Delete all existing admin profiles
DELETE FROM public.admin_profiles;

-- Note: This will remove all admin profiles, but keep the auth.users records
-- The auth.users records can be manually deleted from the Supabase dashboard if needed