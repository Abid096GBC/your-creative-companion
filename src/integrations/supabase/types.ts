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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
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
