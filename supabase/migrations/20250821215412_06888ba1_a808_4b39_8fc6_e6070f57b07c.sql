
-- Corrigir a função accept_team_invitation para garantir que o campo company seja preenchido corretamente
CREATE OR REPLACE FUNCTION accept_team_invitation(p_token text, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation record;
    v_company_profile record;
    v_result json;
BEGIN
    -- Buscar o convite
    SELECT * INTO v_invitation
    FROM team_invitations
    WHERE token = p_token AND status = 'pending'
    AND expires_at > now();

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Convite não encontrado ou expirado');
    END IF;

    -- Buscar dados da empresa que fez o convite
    SELECT * INTO v_company_profile
    FROM client_profiles
    WHERE id = v_invitation.company_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;

    -- Garantir que a empresa tenha um nome válido
    IF v_company_profile.company IS NULL OR v_company_profile.company = '' THEN
        -- Usar o nome da empresa do convite ou o nome do perfil como fallback
        UPDATE client_profiles 
        SET company = COALESCE(v_invitation.company_name, name, 'Empresa')
        WHERE id = v_invitation.company_id;
        
        -- Recarregar os dados da empresa
        SELECT * INTO v_company_profile
        FROM client_profiles
        WHERE id = v_invitation.company_id;
    END IF;

    -- Criar registro na tabela team_members
    INSERT INTO team_members (
        user_id,
        company_id,
        hierarchy_level_id,
        status,
        invited_at,
        joined_at
    ) VALUES (
        p_user_id,
        v_invitation.company_id,
        v_invitation.hierarchy_level_id,
        'active',
        v_invitation.created_at,
        now()
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
        status = 'active',
        hierarchy_level_id = v_invitation.hierarchy_level_id,
        joined_at = now();

    -- Atualizar o perfil do usuário convidado com o nome da empresa
    UPDATE client_profiles
    SET 
        company = v_company_profile.company,
        hierarchy_level_id = v_invitation.hierarchy_level_id
    WHERE id = p_user_id;

    -- Marcar o convite como aceito
    UPDATE team_invitations
    SET 
        status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;

    RETURN json_build_object(
        'success', true,
        'company_name', v_company_profile.company,
        'user_id', p_user_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
