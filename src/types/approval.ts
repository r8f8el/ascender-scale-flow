
export interface ApprovalFlowType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  flow_type_id: string;
  title: string;
  description?: string;
  amount?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  current_step: number;
  total_steps: number;
  requested_by_user_id: string;
  requested_by_name: string;
  requested_by_email: string;
  created_at: string;
  updated_at: string;
  flow_type?: ApprovalFlowType;
}

export interface ApprovalStep {
  id: string;
  flow_type_id: string;
  step_order: number;
  step_name: string;
  approver_role?: string;
  approver_user_id?: string;
  approver_name?: string;
  approver_email?: string;
  is_required: boolean;
  amount_threshold?: number;
  created_at: string;
}

export interface ApprovalHistory {
  id: string;
  request_id: string;
  step_order: number;
  action: 'approved' | 'rejected' | 'commented' | 'delegated';
  approver_user_id?: string;
  approver_name: string;
  approver_email: string;
  comments?: string;
  created_at: string;
}

export interface ApprovalAttachment {
  id: string;
  request_id: string;
  filename: string;
  file_path: string;
  file_size?: number;
  content_type?: string;
  uploaded_by_user_id?: string;
  uploaded_by_name?: string;
  created_at: string;
}
