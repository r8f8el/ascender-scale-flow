export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
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
      anexos: {
        Row: {
          data_upload: string
          id: string
          nome_arquivo: string
          solicitacao_id: string
          tamanho_arquivo: number | null
          tipo_arquivo: string | null
          url_arquivo: string
        }
        Insert: {
          data_upload?: string
          id?: string
          nome_arquivo: string
          solicitacao_id: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          url_arquivo: string
        }
        Update: {
          data_upload?: string
          id?: string
          nome_arquivo?: string
          solicitacao_id?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      automatic_messages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message_content: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message_content: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message_content?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_room_id: string | null
          content: string
          created_at: string
          id: string
          sender_id: string | null
          sender_name: string
          sender_type: string
        }
        Insert: {
          chat_room_id?: string | null
          content: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_name: string
          sender_type?: string
        }
        Update: {
          chat_room_id?: string | null
          content?: string
          created_at?: string
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
          created_at: string
          id: string
          last_message_at: string
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          id?: string
          last_message_at?: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          id?: string
          last_message_at?: string
        }
        Relationships: []
      }
      client_bi_embeds: {
        Row: {
          access_mode: string
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          embed_url: string | null
          external_dashboard_id: string | null
          filters: Json | null
          fpa_client_id: string | null
          id: string
          iframe_html: string | null
          is_active: boolean
          is_featured: boolean
          provider: string
          title: string | null
          updated_at: string
        }
        Insert: {
          access_mode?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          embed_url?: string | null
          external_dashboard_id?: string | null
          filters?: Json | null
          fpa_client_id?: string | null
          id?: string
          iframe_html?: string | null
          is_active?: boolean
          is_featured?: boolean
          provider?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          access_mode?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          embed_url?: string | null
          external_dashboard_id?: string | null
          filters?: Json | null
          fpa_client_id?: string | null
          id?: string
          iframe_html?: string | null
          is_active?: boolean
          is_featured?: boolean
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
          category_id: string | null
          created_at: string
          description: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          updated_at: string
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
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
          hierarchy_level_id: string | null
          id: string
          is_primary_contact: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email: string
          hierarchy_level_id?: string | null
          id: string
          is_primary_contact?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email?: string
          hierarchy_level_id?: string | null
          id?: string
          is_primary_contact?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_hierarchy_level_id_fkey"
            columns: ["hierarchy_level_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_levels"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Relationships: []
      }
      company_teams: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          client_id: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder: string | null
          id: string
          name: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_aprovadores: {
        Row: {
          aprovador_id: string
          cliente_id: string
          created_at: string
          email_aprovador: string
          id: string
          nome_aprovador: string
          ordem: number
        }
        Insert: {
          aprovador_id: string
          cliente_id: string
          created_at?: string
          email_aprovador: string
          id?: string
          nome_aprovador: string
          ordem?: number
        }
        Update: {
          aprovador_id?: string
          cliente_id?: string
          created_at?: string
          email_aprovador?: string
          id?: string
          nome_aprovador?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_aprovadores_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_clients: {
        Row: {
          business_model: string | null
          client_profile_id: string
          company_name: string
          created_at: string
          current_phase: number
          id: string
          industry: string | null
          onboarding_completed: boolean
          strategic_objectives: string | null
          updated_at: string
        }
        Insert: {
          business_model?: string | null
          client_profile_id: string
          company_name: string
          created_at?: string
          current_phase?: number
          id?: string
          industry?: string | null
          onboarding_completed?: boolean
          strategic_objectives?: string | null
          updated_at?: string
        }
        Update: {
          business_model?: string | null
          client_profile_id?: string
          company_name?: string
          created_at?: string
          current_phase?: number
          id?: string
          industry?: string | null
          onboarding_completed?: boolean
          strategic_objectives?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fpa_clients_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_data_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string | null
          file_type: string | null
          fpa_client_id: string
          id: string
          records_count: number | null
          status: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path?: string | null
          file_type?: string | null
          fpa_client_id: string
          id?: string
          records_count?: number | null
          status?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_type?: string | null
          fpa_client_id?: string
          id?: string
          records_count?: number | null
          status?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fpa_data_uploads_fpa_client_id_fkey"
            columns: ["fpa_client_id"]
            isOneToOne: false
            referencedRelation: "fpa_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fpa_financial_data: {
        Row: {
          account_name: string
          account_type: string
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          fpa_client_id: string
          id: string
          notes: string | null
          period_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          fpa_client_id: string
          id?: string
          notes?: string | null
          period_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          fpa_client_id?: string
          id?: string
          notes?: string | null
          period_id?: string | null
          updated_at?: string
        }
        Relationships: [
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
          created_at: string
          end_date: string
          fpa_client_id: string
          id: string
          is_actual: boolean
          period_name: string
          period_type: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          fpa_client_id: string
          id?: string
          is_actual?: boolean
          period_name: string
          period_type?: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          fpa_client_id?: string
          id?: string
          is_actual?: boolean
          period_name?: string
          period_type?: string
          start_date?: string
        }
        Relationships: [
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
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          fpa_client_id: string
          id: string
          report_type: string
          title: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fpa_client_id: string
          id?: string
          report_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fpa_client_id?: string
          id?: string
          report_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
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
          account_name: string
          actual_amount: number
          analysis_notes: string | null
          budget_amount: number
          created_at: string
          fpa_client_id: string
          id: string
          period_id: string | null
          variance_amount: number | null
          variance_percentage: number | null
        }
        Insert: {
          account_name: string
          actual_amount?: number
          analysis_notes?: string | null
          budget_amount?: number
          created_at?: string
          fpa_client_id: string
          id?: string
          period_id?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Update: {
          account_name?: string
          actual_amount?: number
          analysis_notes?: string | null
          budget_amount?: number
          created_at?: string
          fpa_client_id?: string
          id?: string
          period_id?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
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
          priority: string
          progress: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name: string
          priority?: string
          progress?: number
          start_date?: string
          status?: string
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
          priority?: string
          progress?: number
          start_date?: string
          status?: string
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
        ]
      }
      gantt_task_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          task_id?: string
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
          category: string | null
          collaborators: Json | null
          created_at: string
          dependencies: Json | null
          description: string | null
          end_date: string
          estimated_hours: number | null
          id: string
          is_milestone: boolean
          name: string
          priority: string
          progress: number
          project_id: string
          start_date: string
          tags: Json | null
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          category?: string | null
          collaborators?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          end_date?: string
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean
          name: string
          priority?: string
          progress?: number
          project_id: string
          start_date?: string
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          category?: string | null
          collaborators?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          end_date?: string
          estimated_hours?: number | null
          id?: string
          is_milestone?: boolean
          name?: string
          priority?: string
          progress?: number
          project_id?: string
          start_date?: string
          tags?: Json | null
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
          description: string | null
          hours: number
          id: string
          log_date: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hours: number
          id?: string
          log_date?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hours?: number
          id?: string
          log_date?: string
          task_id?: string
          user_id?: string | null
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
      hierarchy_levels: {
        Row: {
          can_approve: boolean
          can_invite_members: boolean
          created_at: string
          id: string
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          can_approve?: boolean
          can_invite_members?: boolean
          created_at?: string
          id?: string
          level?: number
          name: string
          updated_at?: string
        }
        Update: {
          can_approve?: boolean
          can_invite_members?: boolean
          created_at?: string
          id?: string
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_aprovacao: {
        Row: {
          acao: string
          comentario: string | null
          data_acao: string
          id: string
          nome_usuario: string
          solicitacao_id: string
          usuario_id: string
        }
        Insert: {
          acao: string
          comentario?: string | null
          data_acao?: string
          id?: string
          nome_usuario: string
          solicitacao_id: string
          usuario_id: string
        }
        Update: {
          acao?: string
          comentario?: string | null
          data_acao?: string
          id?: string
          nome_usuario?: string
          solicitacao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_aprovacao_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          board_order: number
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
          board_order?: number
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
          board_order?: number
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
        ]
      }
      kanban_columns: {
        Row: {
          board_id: string
          color: string
          column_order: number
          created_at: string
          id: string
          is_done_column: boolean
          name: string
          updated_at: string
          wip_limit: number | null
        }
        Insert: {
          board_id: string
          color?: string
          column_order?: number
          created_at?: string
          id?: string
          is_done_column?: boolean
          name: string
          updated_at?: string
          wip_limit?: number | null
        }
        Update: {
          board_id?: string
          color?: string
          column_order?: number
          created_at?: string
          id?: string
          is_done_column?: boolean
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
      kanban_task_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          task_id?: string
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
          actual_hours: number
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
          priority: string
          start_date: string | null
          task_order: number
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number
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
          priority?: string
          start_date?: string | null
          task_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number
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
          priority?: string
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
        ]
      }
      kanban_time_logs: {
        Row: {
          created_at: string
          description: string | null
          hours: number
          id: string
          log_date: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hours: number
          id?: string
          log_date?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hours?: number
          id?: string
          log_date?: string
          task_id?: string
          user_id?: string | null
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
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          scheduled_date: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          scheduled_date?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          scheduled_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
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
        ]
      }
      schedule_phases: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          project_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          aprovador_atual_id: string | null
          aprovadores_completos: Json | null
          aprovadores_necessarios: Json | null
          data_criacao: string
          data_limite: string | null
          data_ultima_modificacao: string
          descricao: string | null
          etapa_atual: number
          id: string
          justificativa: string | null
          periodo_referencia: string
          prioridade: string
          solicitante_id: string
          status: string
          tipo_solicitacao: string | null
          titulo: string
          valor_solicitado: number | null
        }
        Insert: {
          aprovador_atual_id?: string | null
          aprovadores_completos?: Json | null
          aprovadores_necessarios?: Json | null
          data_criacao?: string
          data_limite?: string | null
          data_ultima_modificacao?: string
          descricao?: string | null
          etapa_atual?: number
          id?: string
          justificativa?: string | null
          periodo_referencia: string
          prioridade?: string
          solicitante_id: string
          status?: string
          tipo_solicitacao?: string | null
          titulo: string
          valor_solicitado?: number | null
        }
        Update: {
          aprovador_atual_id?: string | null
          aprovadores_completos?: Json | null
          aprovadores_necessarios?: Json | null
          data_criacao?: string
          data_limite?: string | null
          data_ultima_modificacao?: string
          descricao?: string | null
          etapa_atual?: number
          id?: string
          justificativa?: string | null
          periodo_referencia?: string
          prioridade?: string
          solicitante_id?: string
          status?: string
          tipo_solicitacao?: string | null
          titulo?: string
          valor_solicitado?: number | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
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
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_name: string
          message: string | null
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          inviter_name: string
          message?: string | null
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_name?: string
          message?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          company_id: string | null
          created_at: string
          hierarchy_level_id: string | null
          id: string
          invited_by: string | null
          invited_email: string | null
          joined_at: string | null
          name: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          hierarchy_level_id?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          joined_at?: string | null
          name?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          hierarchy_level_id?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          joined_at?: string | null
          name?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_hierarchy_level_id_fkey"
            columns: ["hierarchy_level_id"]
            isOneToOne: false
            referencedRelation: "hierarchy_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          ticket_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          ticket_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          ticket_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
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
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ticket_priorities: {
        Row: {
          color: string
          created_at: string
          id: string
          level: number
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          level?: number
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_email: string | null
          sender_name: string | null
          sender_type: string | null
          ticket_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_email?: string | null
          sender_name?: string | null
          sender_type?: string | null
          ticket_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_email?: string | null
          sender_name?: string | null
          sender_type?: string | null
          ticket_id?: string | null
        }
        Relationships: [
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
          created_at: string
          id: string
          is_closed: boolean
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          name?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority_id: string | null
          resolved_at: string | null
          status_id: string | null
          ticket_number: string
          title: string
          updated_at: string
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority_id?: string | null
          resolved_at?: string | null
          status_id?: string | null
          ticket_number: string
          title: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority_id?: string | null
          resolved_at?: string | null
          status_id?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
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
      [_ in never]: never
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
