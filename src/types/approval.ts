
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';
export type ApprovalAction = 'created' | 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'commented' | 'modified';

export interface ApprovalFlowType {
  id: string;
  name: string;
  description?: string;
  required_fields?: Record<string, boolean>;
  routing_rules?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  flow_type_id: string;
  step_number: number;
  step_name: string;
  approver_user_id?: string;
  approver_role?: string;
  is_required: boolean;
  conditions?: Record<string, any>;
  timeout_hours?: number;
  is_active: boolean;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  flow_type_id: string;
  title: string;
  description?: string;
  requested_by_user_id: string;
  status: ApprovalStatus;
  priority: PriorityLevel;
  amount?: number;
  department?: string;
  cost_center?: string;
  business_justification?: string;
  expected_outcome?: string;
  risk_assessment?: string;
  due_date?: string;
  current_step: number;
  total_steps?: number;
  form_data?: Record<string, any>;
  attachments?: Record<string, any>;
  tags?: string[];
  created_at: string;
  updated_at: string;
  flow_type?: ApprovalFlowType;
}

export interface ApprovalHistory {
  id: string;
  request_id: string;
  actor_user_id?: string;
  actor_name?: string;
  actor_role?: string;
  action: ApprovalAction;
  comments?: string;
  step_number?: number;
  previous_status?: ApprovalStatus;
  new_status?: ApprovalStatus;
  created_at: string;
}

export interface CreateApprovalRequestData {
  flow_type_id: string;
  title: string;
  description?: string;
  priority?: PriorityLevel;
  amount?: number;
  department?: string;
  cost_center?: string;
  business_justification?: string;
  expected_outcome?: string;
  risk_assessment?: string;
  due_date?: string;
  form_data?: Record<string, any>;
  attachments?: Record<string, any>;
  tags?: string[];
}

export interface ApprovalDecisionData {
  requestId: string;
  action: 'approve' | 'reject';
  comments?: string;
}
