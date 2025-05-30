export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          datastore_id: string | null
          description: string
          icon_url: string | null
          id: string
          include_sources: boolean
          is_active: boolean
          max_tokens: number | null
          model_name: Database["public"]["Enums"]["AgentModelName"]
          name: string
          organization_id: string | null
          restrict_knowledge: boolean
          system_prompt: string | null
          temperature: number
          updated_at: string
          user_prompt: string | null
        }
        Insert: {
          created_at?: string
          datastore_id?: string | null
          description: string
          icon_url?: string | null
          id: string
          include_sources?: boolean
          is_active?: boolean
          max_tokens?: number | null
          model_name?: Database["public"]["Enums"]["AgentModelName"]
          name: string
          organization_id?: string | null
          restrict_knowledge?: boolean
          system_prompt?: string | null
          temperature?: number
          updated_at: string
          user_prompt?: string | null
        }
        Update: {
          created_at?: string
          datastore_id?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          include_sources?: boolean
          is_active?: boolean
          max_tokens?: number | null
          model_name?: Database["public"]["Enums"]["AgentModelName"]
          name?: string
          organization_id?: string | null
          restrict_knowledge?: boolean
          system_prompt?: string | null
          temperature?: number
          updated_at?: string
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_datastore_id_fkey"
            columns: ["datastore_id"]
            isOneToOne: false
            referencedRelation: "datastores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          key: string
          name: string
          organization_id: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          cost_usd: number | null
          endpoint: string
          id: string
          method: string
          response_time: number | null
          status_code: number
          timestamp: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          endpoint: string
          id: string
          method: string
          response_time?: number | null
          status_code: number
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          endpoint?: string
          id?: string
          method?: string
          response_time?: number | null
          status_code?: number
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          metadata: Json | null
          status: string
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id: string
          metadata?: Json | null
          status?: string
          summary?: string | null
          title?: string | null
          updated_at: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      datasources: {
        Row: {
          config: Json | null
          created_at: string
          datastore_id: string
          id: string
          name: string
          status: Database["public"]["Enums"]["DatasourceStatus"]
          type: Database["public"]["Enums"]["DatasourceType"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          datastore_id: string
          id: string
          name: string
          status?: Database["public"]["Enums"]["DatasourceStatus"]
          type: Database["public"]["Enums"]["DatasourceType"]
          updated_at: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          datastore_id?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["DatasourceStatus"]
          type?: Database["public"]["Enums"]["DatasourceType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasources_datastore_id_fkey"
            columns: ["datastore_id"]
            isOneToOne: false
            referencedRelation: "datastores"
            referencedColumns: ["id"]
          },
        ]
      }
      datastores: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          type: Database["public"]["Enums"]["DatastoreType"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id: string
          name: string
          organization_id: string
          type?: Database["public"]["Enums"]["DatastoreType"]
          updated_at: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          type?: Database["public"]["Enums"]["DatastoreType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "datastores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          invited_token: string | null
          organization_id: string
          role: Database["public"]["Enums"]["MembershipRole"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          invited_email?: string | null
          invited_token?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["MembershipRole"]
          updated_at: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          invited_token?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["MembershipRole"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          icon_url: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id: string
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          created_at: string
          id: string
          nbAgentQueries: number
          nbDataProcessed: number
          nbModelTokens: number
          organization_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nbAgentQueries?: number
          nbDataProcessed?: number
          nbModelTokens?: number
          organization_id?: string | null
          updated_at: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nbAgentQueries?: number
          nbDataProcessed?: number
          nbModelTokens?: number
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          email_verified: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          email_verified?: string | null
          id: string
          name?: string | null
          updated_at: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          email_verified?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AgentModelName:
        | "gpt_3_5_turbo"
        | "gpt_4"
        | "gpt_4_turbo"
        | "gpt_4o"
        | "claude_3_haiku"
        | "claude_3_sonnet"
        | "claude_3_opus"
      DatasourceStatus:
        | "unsynched"
        | "pending"
        | "running"
        | "synched"
        | "error"
      DatasourceType: "file" | "web_page" | "web_site" | "text"
      DatastoreType: "text" | "qa" | "web_page" | "web_site" | "file"
      MembershipRole: "OWNER" | "ADMIN" | "MEMBER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      AgentModelName: [
        "gpt_3_5_turbo",
        "gpt_4",
        "gpt_4_turbo",
        "gpt_4o",
        "claude_3_haiku",
        "claude_3_sonnet",
        "claude_3_opus",
      ],
      DatasourceStatus: ["unsynched", "pending", "running", "synched", "error"],
      DatasourceType: ["file", "web_page", "web_site", "text"],
      DatastoreType: ["text", "qa", "web_page", "web_site", "file"],
      MembershipRole: ["OWNER", "ADMIN", "MEMBER"],
    },
  },
} as const