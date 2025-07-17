
-- Função para buscar aprovações pendentes para um usuário específico
CREATE OR REPLACE FUNCTION get_pending_approvals_for_user(user_id UUID)
RETURNS TABLE (
  id UUID,
  flow_type_id UUID,
  title VARCHAR(500),
  description TEXT,
  requested_by_user_id UUID,
  status approval_status,
  priority priority_level,
  amount DECIMAL(15,2),
  department VARCHAR(255),
  cost_center VARCHAR(255),
  business_justification TEXT,
  expected_outcome TEXT,
  risk_assessment TEXT,
  due_date DATE,
  current_step INTEGER,
  total_steps INTEGER,
  form_data JSONB,
  attachments JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.id,
    ar.flow_type_id,
    ar.title,
    ar.description,
    ar.requested_by_user_id,
    ar.status,
    ar.priority,
    ar.amount,
    ar.department,
    ar.cost_center,
    ar.business_justification,
    ar.expected_outcome,
    ar.risk_assessment,
    ar.due_date,
    ar.current_step,
    ar.total_steps,
    ar.form_data,
    ar.attachments,
    ar.tags,
    ar.created_at,
    ar.updated_at
  FROM approval_requests ar
  JOIN approval_steps s ON ar.flow_type_id = s.flow_type_id
  WHERE ar.status IN ('pending', 'in_progress')
  AND s.step_number = ar.current_step
  AND (
    s.approver_user_id = user_id OR 
    s.approver_role IN (
      SELECT role FROM admin_profiles WHERE id = user_id
    )
  )
  ORDER BY ar.created_at DESC;
END;
$$;
