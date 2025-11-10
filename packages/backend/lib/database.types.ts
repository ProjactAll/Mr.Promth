// Database Types for Supabase
// Auto-generated types for database schema

export interface Database {
  public: {
    Tables: {
      project_files: {
        Row: {
          id: string
          workflow_id: string
          file_path: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          file_path: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          file_path?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          user_id: string
          project_name: string
          project_description: string | null
          status: string
          result: any | null
          error: string | null
          created_at: string
          updated_at: string
          project_package_url: string | null
          deployment_url: string | null
          github_repo_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          project_description?: string | null
          status?: string
          result?: any | null
          error?: string | null
          created_at?: string
          updated_at?: string
          project_package_url?: string | null
          deployment_url?: string | null
          github_repo_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          project_description?: string | null
          status?: string
          result?: any | null
          error?: string | null
          created_at?: string
          updated_at?: string
          project_package_url?: string | null
          deployment_url?: string | null
          github_repo_url?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          metadata: any | null
          created_at: string
          updated_at: string
          active_project_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          active_project_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          active_project_id?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          sender: string
          content: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: string
          content: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: string
          content?: string
          metadata?: any | null
          created_at?: string
        }
      }
    }
  }
}
