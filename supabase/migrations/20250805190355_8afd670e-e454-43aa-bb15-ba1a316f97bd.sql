
-- Criar função RPC otimizada para buscar dados do dashboard do cliente
CREATE OR REPLACE FUNCTION get_client_dashboard_data(client_id UUID)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION get_client_dashboard_data(UUID) TO authenticated;
