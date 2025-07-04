
-- Limpar usuários existentes se houver
DELETE FROM auth.users WHERE email IN ('cliente@portobello.com.br', 'cliente@jassy.com.br');
DELETE FROM client_profiles WHERE email IN ('cliente@portobello.com.br', 'cliente@jassy.com.br');

-- Inserir usuário Portobello
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  deleted_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'cliente@portobello.com.br',
  crypt('portobello123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  null,
  '{"provider":"email","providers":["email"]}',
  '{"name":"Portobello"}',
  false,
  'authenticated',
  'authenticated',
  null,
  null,
  '',
  0,
  null,
  null
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Inserir usuário J.Assy
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  deleted_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'cliente@jassy.com.br',
  crypt('jassy123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  null,
  '{"provider":"email","providers":["email"]}',
  '{"name":"J.Assy"}',
  false,
  'authenticated',
  'authenticated',
  null,
  null,
  '',
  0,
  null,
  null
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Inserir perfis de cliente correspondentes
INSERT INTO client_profiles (id, name, email, company, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Portobello', 'cliente@portobello.com.br', 'Portobello', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'J.Assy', 'cliente@jassy.com.br', 'J.Assy', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  company = EXCLUDED.company,
  updated_at = now();
