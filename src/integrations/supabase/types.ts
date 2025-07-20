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
      account_deletions: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      completed_jobs: {
        Row: {
          created_at: string
          credits_deducted: number
          edit_id: string
          full_image_url: string
          id: string
          is_favorite: boolean
          original_image_url: string
          preview_image_url: string
          prompt: string | null
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_deducted?: number
          edit_id: string
          full_image_url: string
          id?: string
          is_favorite?: boolean
          original_image_url: string
          preview_image_url: string
          prompt?: string | null
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_deducted?: number
          edit_id?: string
          full_image_url?: string
          id?: string
          is_favorite?: boolean
          original_image_url?: string
          preview_image_url?: string
          prompt?: string | null
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_submissions: {
        Row: {
          created_at: string
          edit_id: string
          id: string
          original_image_url: string
          prompt: string | null
          status: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edit_id: string
          id?: string
          original_image_url: string
          prompt?: string | null
          status?: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          edit_id?: string
          id?: string
          original_image_url?: string
          prompt?: string | null
          status?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      upscaled_images: {
        Row: {
          completed_job_id: string
          created_at: string
          id: string
          scale_factor: string | null
          status: string
          updated_at: string
          upscale_task_id: string | null
          upscaled_image_url: string | null
          user_id: string
        }
        Insert: {
          completed_job_id: string
          created_at?: string
          id?: string
          scale_factor?: string | null
          status?: string
          updated_at?: string
          upscale_task_id?: string | null
          upscaled_image_url?: string | null
          user_id: string
        }
        Update: {
          completed_job_id?: string
          created_at?: string
          id?: string
          scale_factor?: string | null
          status?: string
          updated_at?: string
          upscale_task_id?: string | null
          upscaled_image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upscaled_images_completed_job_id_fkey"
            columns: ["completed_job_id"]
            isOneToOne: false
            referencedRelation: "completed_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_status: {
        Row: {
          approved_rules: boolean
          created_at: string
          credits: number
          did_tutorial: boolean
          id: string
          last_credit_purchase: string | null
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_rules?: boolean
          created_at?: string
          credits?: number
          did_tutorial?: boolean
          id?: string
          last_credit_purchase?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_rules?: boolean
          created_at?: string
          credits?: number
          did_tutorial?: boolean
          id?: string
          last_credit_purchase?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_job_transaction: {
        Args: {
          p_user_id: string
          p_edit_id: string
          p_original_image_url: string
          p_preview_image_url: string
          p_full_image_url: string
          p_style: string
          p_prompt: string
        }
        Returns: undefined
      }
      start_job_with_credit_check: {
        Args: {
          p_user_id: string
          p_edit_id: string
          p_original_image_url: string
          p_style: string
          p_prompt: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      update_credits: {
        Args: { p_user_id: string; p_credit_change: number }
        Returns: undefined
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
