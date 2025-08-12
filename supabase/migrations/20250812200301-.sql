-- Secure admin_profiles: remove public SELECT policy and ensure only admins can read
-- 1) Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop the overly permissive policy that allowed public reads
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_profiles'
      AND policyname = 'Allow admin profile select'
  ) THEN
    DROP POLICY "Allow admin profile select" ON public.admin_profiles;
  END IF;
END $$;

-- 3) Ensure there is a restrictive SELECT policy for admins (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_profiles'
      AND policyname = 'Admins can view other admin profiles'
  ) THEN
    CREATE POLICY "Admins can view other admin profiles"
    ON public.admin_profiles
    FOR SELECT
    USING (is_admin_user_safe());
  END IF;
END $$;
