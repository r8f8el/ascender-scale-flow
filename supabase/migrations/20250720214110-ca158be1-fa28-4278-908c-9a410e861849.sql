
-- Fix the ambiguous foreign key relationship between fpa_clients and client_profiles
-- Drop the duplicate foreign key constraint that's causing the ambiguity
ALTER TABLE fpa_clients DROP CONSTRAINT IF EXISTS fk_fpa_clients_profile;

-- Ensure we have only one clean foreign key relationship
ALTER TABLE fpa_clients DROP CONSTRAINT IF EXISTS fpa_clients_client_profile_id_fkey;
ALTER TABLE fpa_clients ADD CONSTRAINT fpa_clients_client_profile_id_fkey 
    FOREIGN KEY (client_profile_id) REFERENCES client_profiles(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_fpa_clients_client_profile_id ON fpa_clients(client_profile_id);
