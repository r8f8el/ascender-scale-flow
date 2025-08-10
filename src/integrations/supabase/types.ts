export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      approval_attachments: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          request_id: string
          uploaded_by_name: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          request_id: string
          uploaded_by_name?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          request_id?: string
          uploaded_by_name?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_flow_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      approval_history: {
        Row: {
          action: string
          approver_email: string
          approver_name: string
          approver_user_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          request_id: string
          step_order: number
        }
        Insert: {
          action: string
          approver_email: string
          approver_name: string
          approver_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id: string
          step_order: number
        }
        Update: {
          action?: string
          approver_email?: string
          approver_name?: string
          approver_user_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          request_id?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          amount: number | null
          created_at: string | null
          current_step: number | null
          description: string | null
          flow_type_id: string
          id: string
          priority: string | null
          requested_by_email: string
          requested_by_name: string
          requested_by_user_id: string
          status: string | null
          title: string
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          flow_type_id: string
          id?: string
          priority?: string | null
          requested_by_email: string
          requested_by_name: string
          requested_by_user_id: string
          status?: string | null
          title: string
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          flow_type_id?: string
          id?: string
          priority?: string | null
          requested_by_email?: string
          requested_by_name?: string
          requested_by_user_id?: string
          status?: string | null
          title?: string
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_flow_type_id_fkey"
            columns: ["flow_type_id"]
            isOneToOne: false
            referencedRelation: "approval_flow_types"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          amount_threshold: number | null
          approver_email: string | null
          approver_name: string | null
          approver_role: string | null
          approver_user_id: string | null
          created_at: string | null
          flow_type_id: string
          id: string
          is_required: boolean | null
          step_name: string
          step_order: number
        }
        Insert: {
          amount_threshold?: number | null
          approver_email?: string | null
          approver_name?: string | null
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string | null
          flow_type_id: string
          id?: string
          is_required?: boolean | null
          step_name: string
          step_order: number
        }
        Update: {
          amount_threshold?: number | null
          approver_email?: string | null
          approver_name?: string | null
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string | null
          flow_type_id?: string
          id?: string
          is_required?: boolean | null
          step_name?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_flow_type_id_fkey"
            columns: ["flow_type_id"]
            isOneToOne: false
            referencedRelation: "approval_flow_types"
            referencedColumns: ["id"]
          },
        ]
      }
      automatic_messages: {
        Row: {
          body: string
          created_at: string
          enabled: boolean
          id: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          enabled?: boolean
          id?: string
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          enabled?: boolean
          id?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_room_id: string | null
          content: string
          created_at: string | null
          id: string
          sender_id: string | null
          sender_name: string
          sender_type: string
        }
        Insert: {
          chat_room_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_name: string
          sender_type: string
        }
        Update: {
          chat_room_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string | null
          id: string
          last_message_at: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_bi_embeds: {
        Row: {
          access_mode: string
          created_at: string
          created_by: string | null
          description: string | null
          embed_url: string | null
          external_dashboard_id: string | null
          filters: Json | null
          fpa_client_id: string | null
          id: string
          iframe_html: string | null
          is_active: boolean
          provider: string
          title: string | null
          updated_at: string
        }
        Insert: {
          access_mode?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          embed_url?: string | null
          external_dashboard_id?: string | null
          filters?: Json | null
          fpa_client_id?: string | null
          id?: string
          iframe_html?: string | null
          is_active?: boolean
          provider: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          access_mode?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          embed_url?: string | null
          external_dashboard_id?: string | null
          filters?: Json | null
          fpa_client_id?: string | null
          id?: string
          iframe_html?: string | null
          is_active?: boolean
          provider?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_bi_embeds_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          category: string | null
          content_type: string | null
          description: string | null
          file_path: string
          file_size: number
          filename: string
          id: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by_admin_id: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content_type?: string | null
          description?: string | null
          file_path: string
          file_size: number
          filename: string
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_admin_id?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content_type?: string | null
          description?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_admin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_uploaded_by_admin_id_fkey"
            columns: ["uploaded_by_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          cnpj: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          is_primary_contact: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email: string
          id: string
          is_primary_contact?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_primary_contact?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_teams: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          invited_email: string | null
          member_id: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          member_id?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          member_id?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_teams_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category_id: string | null
          content_type: string | null
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          content_type?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string | null
          client_id: string | null
          client_name: string | null
          file_path: string
          id: string
          name: string
          size: number
          type: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          file_path: string
          id?: string
          name: string
          size: number
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          file_path?: string
          id?: string
          name?: string
          size?: number
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      fpa_clients: {
        Row: {
          business_model: string | null
          client_profile_id: string | null
          company_name: string
          created_at: string | null
          current_phase: number | null
          id: string
          industry: string | null
          onboarding_completed: boolean | null
          strategic_objectives: string | null
          updated_at: string | null
        }
        Insert: {
          business_model?: string | null
          client_profile_id?: string | null
          company_name: string
          created_at?: string | null
          current_phase?: number | null
          id?: string
          industry?: string | null
          onboarding_completed?: boolean | null
          strategic_objectives?: string | null
          updated_at?: string | null
        }
        Update: {
          business_model?: string | null
          client_profile_id?: string | null
          company_name?: string
          created_at?: string | null
          current_phase?: number | null
          id?: string
          industry?: string | null
          onboarding_completed?: boolean | null
          strategic_objectives?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fpa_clients_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: true
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_communications: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string | null
          fpa_client_id: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          fpa_client_id?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string | null
          fpa_client_id?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_communications_client"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_communications_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_data_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          fpa_client_id: string | null
          id: string
          period_id: string | null
          status: string | null
          uploaded_by: string | null
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          fpa_client_id?: string | null
          id?: string
          period_id?: string | null
          status?: string | null
          uploaded_by?: string | null
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          fpa_client_id?: string | null
          id?: string
          period_id?: string | null
          status?: string | null
          uploaded_by?: string | null
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_data_uploads_client"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fpa_data_uploads_period"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fpa_data_uploads_uploader"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_data_uploads_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_data_uploads_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_data_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_driver_values: {
        Row: {
          created_at: string | null
          driver_id: string | null
          id: string
          period_id: string | null
          scenario_name: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          period_id?: string | null
          scenario_name?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          period_id?: string | null
          scenario_name?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fpa_driver_values_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "fpa_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_driver_values_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_drivers: {
        Row: {
          created_at: string | null
          description: string | null
          driver_type: string
          formula: string | null
          fpa_client_id: string | null
          id: string
          is_active: boolean | null
          name: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          driver_type: string
          formula?: string | null
          fpa_client_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          driver_type?: string
          formula?: string | null
          fpa_client_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fpa_drivers_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_financial_data: {
        Row: {
          cash_balance: number | null
          cost_of_goods_sold: number | null
          created_at: string | null
          current_assets: number | null
          current_liabilities: number | null
          depreciation: number | null
          ebit: number | null
          ebitda: number | null
          equity: number | null
          financial_expenses: number | null
          financing_cash_flow: number | null
          fpa_client_id: string | null
          gross_profit: number | null
          id: string
          investing_cash_flow: number | null
          net_cash_flow: number | null
          net_income: number | null
          non_current_assets: number | null
          non_current_liabilities: number | null
          operating_cash_flow: number | null
          operating_expenses: number | null
          period_id: string | null
          revenue: number | null
          scenario_name: string | null
          total_assets: number | null
          updated_at: string | null
        }
        Insert: {
          cash_balance?: number | null
          cost_of_goods_sold?: number | null
          created_at?: string | null
          current_assets?: number | null
          current_liabilities?: number | null
          depreciation?: number | null
          ebit?: number | null
          ebitda?: number | null
          equity?: number | null
          financial_expenses?: number | null
          financing_cash_flow?: number | null
          fpa_client_id?: string | null
          gross_profit?: number | null
          id?: string
          investing_cash_flow?: number | null
          net_cash_flow?: number | null
          net_income?: number | null
          non_current_assets?: number | null
          non_current_liabilities?: number | null
          operating_cash_flow?: number | null
          operating_expenses?: number | null
          period_id?: string | null
          revenue?: number | null
          scenario_name?: string | null
          total_assets?: number | null
          updated_at?: string | null
        }
        Update: {
          cash_balance?: number | null
          cost_of_goods_sold?: number | null
          created_at?: string | null
          current_assets?: number | null
          current_liabilities?: number | null
          depreciation?: number | null
          ebit?: number | null
          ebitda?: number | null
          equity?: number | null
          financial_expenses?: number | null
          financing_cash_flow?: number | null
          fpa_client_id?: string | null
          gross_profit?: number | null
          id?: string
          investing_cash_flow?: number | null
          net_cash_flow?: number | null
          net_income?: number | null
          non_current_assets?: number | null
          non_current_liabilities?: number | null
          operating_cash_flow?: number | null
          operating_expenses?: number | null
          period_id?: string | null
          revenue?: number | null
          scenario_name?: string | null
          total_assets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_financial_data_client"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fpa_financial_data_period"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_financial_data_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_financial_data_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_periods: {
        Row: {
          created_at: string | null
          end_date: string
          fpa_client_id: string | null
          id: string
          is_actual: boolean | null
          period_name: string
          period_type: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          fpa_client_id?: string | null
          id?: string
          is_actual?: boolean | null
          period_name: string
          period_type: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          fpa_client_id?: string | null
          id?: string
          is_actual?: boolean | null
          period_name?: string
          period_type?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_periods_client"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_periods_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_reports: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          fpa_client_id: string | null
          id: string
          insights: string | null
          period_covered: string
          report_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          fpa_client_id?: string | null
          id?: string
          insights?: string | null
          period_covered: string
          report_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          fpa_client_id?: string | null
          id?: string
          insights?: string | null
          period_covered?: string
          report_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_reports_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_reports_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_variance_analysis: {
        Row: {
          actual_value: number
          analysis_comment: string | null
          created_at: string | null
          created_by: string | null
          fpa_client_id: string | null
          id: string
          metric_name: string
          period_id: string | null
          planned_value: number
          variance_amount: number
          variance_percentage: number
        }
        Insert: {
          actual_value: number
          analysis_comment?: string | null
          created_at?: string | null
          created_by?: string | null
          fpa_client_id?: string | null
          id?: string
          metric_name: string
          period_id?: string | null
          planned_value: number
          variance_amount: number
          variance_percentage: number
        }
        Update: {
          actual_value?: number
          analysis_comment?: string | null
          created_at?: string | null
          created_by?: string | null
          fpa_client_id?: string | null
          id?: string
          metric_name?: string
          period_id?: string | null
          planned_value?: number
          variance_amount?: number
          variance_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_fpa_variance_analysis_client"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fpa_variance_analysis_creator"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fpa_variance_analysis_period"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_variance_analysis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_variance_analysis_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fpa_variance_analysis_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fpa_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      gantt_projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          priority: string | null
          progress: number | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          priority?: string | null
          progress?: number | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: string | null
          progress?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gantt_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gantt_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gantt_task_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gantt_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "gantt_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      gantt_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          attachments: Json
          created_at: string
          created_by: string | null
          dependencies: Json | null
          description: string | null
          end_date: string
          estimated_hours: number | null
          id: string
          is_milestone: boolean | null
          labels: Json
          name: string
          priority: string | null
          progress: number | null
          project_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          dependencies?: Json | null
          description?: string | null
          end_date: string
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          labels?: Json
          name: string
          priority?: string | null
          progress?: number | null
          project_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          dependencies?: Json | null
          description?: string | null
          end_date?: string
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean | null
          labels?: Json
          name?: string
          priority?: string | null
          progress?: number | null
          project_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gantt_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gantt_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "gantt_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gantt_time_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          note: string | null
          started_at: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          started_at?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          started_at?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gantt_time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "gantt_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          board_order: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          board_order?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          board_order?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_boards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          board_id: string
          color: string | null
          column_order: number
          created_at: string
          id: string
          is_done_column: boolean | null
          name: string
          updated_at: string
          wip_limit: number | null
        }
        Insert: {
          board_id: string
          color?: string | null
          column_order?: number
          created_at?: string
          id?: string
          is_done_column?: boolean | null
          name: string
          updated_at?: string
          wip_limit?: number | null
        }
        Update: {
          board_id?: string
          color?: string | null
          column_order?: number
          created_at?: string
          id?: string
          is_done_column?: boolean | null
          name?: string
          updated_at?: string
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_sprints: {
        Row: {
          board_id: string
          created_at: string
          end_date: string
          goal: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          board_id: string
          created_at?: string
          end_date: string
          goal?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          end_date?: string
          goal?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_sprints_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_task_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kanban_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          attachments: Json | null
          board_id: string
          checklist: Json | null
          column_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          labels: Json | null
          priority: string | null
          sprint_id: string | null
          start_date: string | null
          task_order: number
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          board_id: string
          checklist?: Json | null
          column_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: Json | null
          priority?: string | null
          sprint_id?: string | null
          start_date?: string | null
          task_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          board_id?: string
          checklist?: Json | null
          column_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: Json | null
          priority?: string | null
          sprint_id?: string | null
          start_date?: string | null
          task_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "kanban_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_time_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          note: string | null
          started_at: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          started_at?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          note?: string | null
          started_at?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kanban_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient_email: string
          sent_at: string | null
          subject: string
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_email: string
          sent_at?: string | null
          subject: string
          type?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_email?: string
          sent_at?: string | null
          subject?: string
          type?: string
        }
        Relationships: []
      }
      project_schedules: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string
          progress: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          description: string
          id: string
          response: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          response?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          response?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_phases: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          phase_order: number
          schedule_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          phase_order?: number
          schedule_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          phase_order?: number
          schedule_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_phases_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "project_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          client_name: string
          created_at: string
          description: string
          end_date: string
          id: string
          phase: string
          project_title: string
          responsible: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          phase: string
          project_title: string
          responsible: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          phase?: string
          project_title?: string
          responsible?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string
          level: string
          type: string
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address: string
          level?: string
          type: string
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string
          level?: string
          type?: string
          user_name?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          task_type: string
          user_id: string
          user_name: string
          user_type: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          task_type: string
          user_id: string
          user_name: string
          user_type: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          task_type?: string
          user_id?: string
          user_name?: string
          user_type?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          response_id: string | null
          ticket_id: string
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          response_id?: string | null
          ticket_id: string
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          response_id?: string | null
          ticket_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "ticket_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ticket_priorities: {
        Row: {
          color: string
          created_at: string | null
          id: string
          level: number
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          level: number
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_internal_note: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_statuses: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          is_closed: boolean | null
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_closed?: boolean | null
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_closed?: boolean | null
          name?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          priority_id: string
          resolved_at: string | null
          status_id: string
          ticket_number: string
          title: string
          updated_at: string | null
          user_email: string
          user_id: string | null
          user_name: string
          user_phone: string
        }
        Insert: {
          assigned_to?: string | null
          category_id: string
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority_id: string
          resolved_at?: string | null
          status_id: string
          ticket_number: string
          title: string
          updated_at?: string | null
          user_email: string
          user_id?: string | null
          user_name: string
          user_phone: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority_id?: string
          resolved_at?: string | null
          status_id?: string
          ticket_number?: string
          title?: string
          updated_at?: string | null
          user_email?: string
          user_id?: string | null
          user_name?: string
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "ticket_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "ticket_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_period_name: {
        Args: { start_date: string; period_type: string }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_client_dashboard_data: {
        Args: { client_id: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      invite_team_member: {
        Args: { p_email: string; p_company_id: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_system_action: {
        Args: {
          p_user_name: string
          p_type: string
          p_ip_address: string
          p_action: string
          p_details?: string
          p_level?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
