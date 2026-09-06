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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string
          amount: number | null
          body_region: string | null
          created_at: string
          customer_name: string
          details: Json
          discount: number
          id: string
          notes: string | null
          nurse_id: string | null
          nurse_share: number | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          phone: string
          platform_share: number | null
          price_estimate: string | null
          promo_code: string | null
          rating: number | null
          referral_code: string | null
          review: string | null
          service: string
          status: string
          stitch_count: number | null
          tier: string
          time_slot: string | null
          total: number | null
          tracking_id: string
          trx_id: string | null
          updated_at: string
        }
        Insert: {
          address: string
          amount?: number | null
          body_region?: string | null
          created_at?: string
          customer_name: string
          details?: Json
          discount?: number
          id?: string
          notes?: string | null
          nurse_id?: string | null
          nurse_share?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          phone: string
          platform_share?: number | null
          price_estimate?: string | null
          promo_code?: string | null
          rating?: number | null
          referral_code?: string | null
          review?: string | null
          service: string
          status?: string
          stitch_count?: number | null
          tier?: string
          time_slot?: string | null
          total?: number | null
          tracking_id: string
          trx_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          amount?: number | null
          body_region?: string | null
          created_at?: string
          customer_name?: string
          details?: Json
          discount?: number
          id?: string
          notes?: string | null
          nurse_id?: string | null
          nurse_share?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string
          platform_share?: number | null
          price_estimate?: string | null
          promo_code?: string | null
          rating?: number | null
          referral_code?: string | null
          review?: string | null
          service?: string
          status?: string
          stitch_count?: number | null
          tier?: string
          time_slot?: string | null
          total?: number | null
          tracking_id?: string
          trx_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          active: boolean
          created_at: string
          description: string
          discount_pct: number
          id: string
          image_url: string | null
          item_key: string
          kind: string
          name: string
          name_en: string
          price: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          discount_pct?: number
          id?: string
          image_url?: string | null
          item_key: string
          kind?: string
          name: string
          name_en?: string
          price?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          discount_pct?: number
          id?: string
          image_url?: string | null
          item_key?: string
          kind?: string
          name?: string
          name_en?: string
          price?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          photo: string | null
          sender: string
          sender_name: string
          text: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo?: string | null
          sender?: string
          sender_name?: string
          text?: string
          thread_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo?: string | null
          sender?: string
          sender_name?: string
          text?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          active: boolean
          created_at: string
          id: string
          last_at: string
          last_message: string
          nurse_id: string | null
          nurse_name: string
          nurse_role: string
          patient_name: string
          patient_phone: string
          service: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          last_at?: string
          last_message?: string
          nurse_id?: string | null
          nurse_name?: string
          nurse_role?: string
          patient_name?: string
          patient_phone?: string
          service?: string
          tracking_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          last_at?: string
          last_message?: string
          nurse_id?: string | null
          nurse_name?: string
          nurse_role?: string
          patient_name?: string
          patient_phone?: string
          service?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_reviews: {
        Row: {
          comment: string
          created_at: string
          doctor_id: string
          id: string
          patient_name: string
          rating: number
        }
        Insert: {
          comment?: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_name?: string
          rating?: number
        }
        Update: {
          comment?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_name?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          active: boolean
          available_slots: string
          chamber_address: string
          consultation_fee: number
          created_at: string
          degrees: string
          id: string
          name: string
          name_en: string
          photo_url: string | null
          rating: number
          rating_count: number
          specialty: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          available_slots?: string
          chamber_address?: string
          consultation_fee?: number
          created_at?: string
          degrees?: string
          id?: string
          name: string
          name_en?: string
          photo_url?: string | null
          rating?: number
          rating_count?: number
          specialty: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          available_slots?: string
          chamber_address?: string
          consultation_fee?: number
          created_at?: string
          degrees?: string
          id?: string
          name?: string
          name_en?: string
          photo_url?: string | null
          rating?: number
          rating_count?: number
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          active: boolean
          created_at: string
          discount_text: string
          id: string
          image_url: string | null
          link_url: string | null
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          discount_text?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          sort_order?: number
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          discount_text?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          active: boolean
          created_at: string
          id: string
          instructions: string
          name: string
          name_en: string
          partner: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          instructions?: string
          name: string
          name_en?: string
          partner?: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          instructions?: string
          name?: string
          name_en?: string
          partner?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          id: string
          last_service: string | null
          name: string | null
          phone: string
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_service?: string | null
          name?: string | null
          phone: string
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_service?: string | null
          name?: string | null
          phone?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      nurse_applications: {
        Row: {
          area: string
          created_at: string
          email: string
          experience: string
          id: string
          name: string
          note: string
          nurse_id: string | null
          phone: string
          qualification: string
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          area?: string
          created_at?: string
          email?: string
          experience?: string
          id?: string
          name: string
          note?: string
          nurse_id?: string | null
          phone: string
          qualification?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          email?: string
          experience?: string
          id?: string
          name?: string
          note?: string
          nurse_id?: string | null
          phone?: string
          qualification?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nurse_applications_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      nurses: {
        Row: {
          active: boolean
          area: string | null
          completed_visits: number
          created_at: string
          id: string
          login_pin: string
          name: string
          nurse_code: string
          phone: string
          photo_url: string | null
          rating: number
          specialties: string[]
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          area?: string | null
          completed_visits?: number
          created_at?: string
          id?: string
          login_pin?: string
          name: string
          nurse_code: string
          phone: string
          photo_url?: string | null
          rating?: number
          specialties?: string[]
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          area?: string | null
          completed_visits?: number
          created_at?: string
          id?: string
          login_pin?: string
          name?: string
          nurse_code?: string
          phone?: string
          photo_url?: string | null
          rating?: number
          specialties?: string[]
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          expiry_date: string | null
          id: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          expiry_date?: string | null
          id?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          expiry_date?: string | null
          id?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          id: string
          name: string
          name_en: string
          price: number
          service_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          name_en?: string
          price?: number
          service_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          name_en?: string
          price?: number
          service_key?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
