-- Delete all admin users from auth.users table
DELETE FROM auth.users WHERE email LIKE '%@ascalate.com.br';

-- This will also trigger the cascade delete for admin_profiles if any remain