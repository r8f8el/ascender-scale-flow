-- Secure functions by setting search_path to public

-- 1. Admin/user role helpers
CREATE OR REPLACE FUNCTION public.is_admin_user_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.admin_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'client');
END;
$$;

-- 2. Generic updated_at helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_fpa_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Chat/messages
CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.chat_rooms 
  SET last_message_at = NOW() 
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$;

-- 4. Financial helpers
CREATE OR REPLACE FUNCTION public.generate_period_name(start_date date, period_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  CASE period_type
    WHEN 'monthly' THEN
      RETURN TO_CHAR(start_date, 'Month YYYY');
    WHEN 'quarterly' THEN
      RETURN 'Q' || EXTRACT(QUARTER FROM start_date) || ' ' || EXTRACT(YEAR FROM start_date);
    WHEN 'yearly' THEN
      RETURN EXTRACT(YEAR FROM start_date)::TEXT;
    ELSE
      RETURN TO_CHAR(start_date, 'DD/MM/YYYY') || ' - ' || TO_CHAR(start_date + INTERVAL '1 month', 'DD/MM/YYYY');
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_period_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.period_name IS NULL OR NEW.period_name = '' THEN
    NEW.period_name := generate_period_name(NEW.start_date, NEW.period_type);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_financial_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Calcular gross_profit se não fornecido
  IF NEW.gross_profit = 0 AND NEW.revenue > 0 AND NEW.cost_of_goods_sold > 0 THEN
    NEW.gross_profit := NEW.revenue - NEW.cost_of_goods_sold;
  END IF;
  
  -- Calcular EBITDA se não fornecido
  IF NEW.ebitda = 0 AND NEW.gross_profit > 0 AND NEW.operating_expenses > 0 THEN
    NEW.ebitda := NEW.gross_profit - NEW.operating_expenses;
  END IF;
  
  -- Calcular EBIT se não fornecido
  IF NEW.ebit = 0 AND NEW.ebitda > 0 AND NEW.depreciation > 0 THEN
    NEW.ebit := NEW.ebitda - NEW.depreciation;
  END IF;
  
  -- Calcular net_income se não fornecido
  IF NEW.net_income = 0 AND NEW.ebit > 0 AND NEW.financial_expenses >= 0 THEN
    NEW.net_income := NEW.ebit - NEW.financial_expenses;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Notifications
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO public.notifications (recipient_email, subject, message, type)
    SELECT 
      c.email,
      'Nova tarefa atribuída: ' || NEW.title,
      'Você foi designado para a tarefa "' || NEW.title || '" no projeto. Prazo: ' || COALESCE(NEW.due_date::text, 'Não definido'),
      'task_assignment'
    FROM public.collaborators c
    WHERE c.id = NEW.assigned_to;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_system_action(p_user_name text, p_type text, p_ip_address text, p_action text, p_details text DEFAULT NULL::text, p_level text DEFAULT 'info'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (user_name, type, ip_address, action, details, level)
  VALUES (p_user_name, p_type, p_ip_address, p_action, p_details, p_level)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 6. Tickets helpers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    ticket_num TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        ticket_num := 'TCK-' || LPAD((FLOOR(RANDOM() * 999999) + 1)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) INTO exists_check;
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN ticket_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

-- 7. Client dashboard data
CREATE OR REPLACE FUNCTION public.get_client_dashboard_data(client_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN json_build_object(
    'projects', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', p.id, 
        'name', p.name, 
        'status', p.status, 
        'progress', p.progress,
        'updated_at', p.updated_at
      )), '[]'::json) 
      FROM projects p 
      WHERE p.client_id = client_id 
      ORDER BY p.updated_at DESC 
      LIMIT 10
    ),
    'recent_files', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', f.id, 
        'name', f.name, 
        'uploaded_at', f.uploaded_at,
        'size', f.size,
        'type', f.type
      )), '[]'::json) 
      FROM files f 
      WHERE f.client_id = client_id 
      ORDER BY f.uploaded_at DESC 
      LIMIT 5
    ),
    'stats', (
      SELECT json_build_object(
        'total_projects', COALESCE(COUNT(*), 0), 
        'active_projects', COALESCE(COUNT(CASE WHEN status = 'active' THEN 1 END), 0),
        'completed_projects', COALESCE(COUNT(CASE WHEN status = 'completed' THEN 1 END), 0)
      ) 
      FROM projects 
      WHERE client_id = client_id
    ),
    'recent_tickets', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', t.id,
        'ticket_number', t.ticket_number,
        'title', t.title,
        'created_at', t.created_at
      )), '[]'::json)
      FROM tickets t
      WHERE t.user_id = client_id
      ORDER BY t.created_at DESC
      LIMIT 3
    )
  );
END;
$$;

-- 8. Team & client auto-create helpers
CREATE OR REPLACE FUNCTION public.invite_team_member(p_email text, p_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_id UUID;
  company_name TEXT;
  inviter_name TEXT;
  function_url TEXT;
BEGIN
  -- Check if the authenticated user is the primary contact of the company
  IF NOT EXISTS (
    SELECT 1 FROM public.client_profiles 
    WHERE id = auth.uid()
    AND id = p_company_id
    AND is_primary_contact = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only primary contacts can invite team members';
  END IF;

  -- Check if email is already invited to this company
  IF EXISTS (
    SELECT 1 FROM public.company_teams 
    WHERE company_id = p_company_id 
    AND invited_email = p_email
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'User already invited to this company';
  END IF;

  -- Check if user with this email already exists and is active in this company
  IF EXISTS (
    SELECT 1 FROM public.company_teams ct
    JOIN public.client_profiles cp ON ct.member_id = cp.id
    WHERE ct.company_id = p_company_id 
    AND cp.email = p_email
    AND ct.status = 'active'
  ) THEN
    RAISE EXCEPTION 'User with this email is already a member of this company';
  END IF;

  -- Get company and inviter information
  SELECT company, name INTO company_name, inviter_name
  FROM public.client_profiles 
  WHERE id = p_company_id;

  -- Create invitation record with email only (member_id will be NULL initially)
  INSERT INTO public.company_teams (company_id, invited_email, invited_by, status, role)
  VALUES (
    p_company_id,
    p_email,
    auth.uid(),
    'pending',
    'member'
  )
  RETURNING id INTO invitation_id;

  -- Get the function URL from environment or use default
  function_url := 'https://klcfzhpttcsjuynumzgi.supabase.co/functions/v1/send-invitation-email';

  -- Send invitation email via edge function using the correct pg_net
  BEGIN
    PERFORM net.http_post(
      url := function_url,
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.headers')::json->>'authorization' || '"}'::jsonb,
      body := json_build_object(
        'invitedEmail', p_email,
        'companyName', COALESCE(company_name, 'Empresa'),
        'inviterName', COALESCE(inviter_name, 'Administrador'),
        'invitationId', invitation_id::text
      )::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send invitation email: %', SQLERRM;
  END;

  RETURN invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_create_fpa_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se não é um email de admin (@ascalate.com.br), criar automaticamente cliente FPA
  IF NEW.email NOT LIKE '%@ascalate.com.br' THEN
    INSERT INTO public.fpa_clients (
      client_profile_id,
      company_name,
      onboarding_completed,
      current_phase
    ) VALUES (
      NEW.id,
      COALESCE(NEW.company, NEW.name),
      false,
      1
    ) ON CONFLICT (client_profile_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;