-- 1. Criar a tabela microsoft_tokens
CREATE TABLE public.microsoft_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'common',
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    user_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    root_folder TEXT NOT NULL DEFAULT 'Ascalate/Clientes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.microsoft_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de RLS para administradores
CREATE POLICY "Admins have full access on microsoft_tokens" ON public.microsoft_tokens
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));
