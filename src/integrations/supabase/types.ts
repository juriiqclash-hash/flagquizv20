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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      clan_invitations: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_invitations_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_members: {
        Row: {
          clan_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["clan_role"]
          user_id: string
        }
        Insert: {
          clan_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["clan_role"]
          user_id: string
        }
        Update: {
          clan_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["clan_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_messages: {
        Row: {
          clan_id: string
          created_at: string
          id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_messages_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          emoji: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          emoji: string
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      friend_messages: {
        Row: {
          created_at: string
          friendship_id: string
          id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          friendship_id: string
          id?: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          friendship_id?: string
          id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          created_at: string
          details: Json | null
          game_mode: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          game_mode: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          game_mode?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          created_at: string
          current_country_code: string | null
          current_question_index: number
          game_mode: string
          id: string
          owner_id: string
          room_code: string
          round_start_timestamp: number | null
          selected_continent: string | null
          selected_game_mode: string | null
          status: string
          time_limit: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_country_code?: string | null
          current_question_index?: number
          game_mode?: string
          id?: string
          owner_id: string
          room_code: string
          round_start_timestamp?: number | null
          selected_continent?: string | null
          selected_game_mode?: string | null
          status?: string
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_country_code?: string | null
          current_question_index?: number
          game_mode?: string
          id?: string
          owner_id?: string
          room_code?: string
          round_start_timestamp?: number | null
          selected_continent?: string | null
          selected_game_mode?: string | null
          status?: string
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      lobby_invitations: {
        Row: {
          created_at: string
          id: string
          lobby_id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lobby_id: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lobby_id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_invitations_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_messages: {
        Row: {
          created_at: string
          id: string
          lobby_id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          lobby_id: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          lobby_id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_messages_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          answer_submitted_at: string | null
          answer_time: string | null
          current_answer: string | null
          id: string
          joined_at: string
          last_answer: string | null
          lives: number
          lobby_id: string | null
          match_id: string | null
          score: number
          status: string
          user_id: string
          username: string
        }
        Insert: {
          answer_submitted_at?: string | null
          answer_time?: string | null
          current_answer?: string | null
          id?: string
          joined_at?: string
          last_answer?: string | null
          lives?: number
          lobby_id?: string | null
          match_id?: string | null
          score?: number
          status?: string
          user_id: string
          username: string
        }
        Update: {
          answer_submitted_at?: string | null
          answer_time?: string | null
          current_answer?: string | null
          id?: string
          joined_at?: string
          last_answer?: string | null
          lives?: number
          lobby_id?: string | null
          match_id?: string | null
          score?: number
          status?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          creator_id: string
          current_country_code: string | null
          current_question_index: number
          id: string
          question_start_time: string | null
          room_code: string
          status: string
          time_limit: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_country_code?: string | null
          current_question_index?: number
          id?: string
          question_start_time?: string | null
          room_code: string
          status?: string
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_country_code?: string | null
          current_question_index?: number
          id?: string
          question_start_time?: string | null
          room_code?: string
          status?: string
          time_limit?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          background_color: string | null
          ban_reason: string | null
          banned: boolean | null
          banned_at: string | null
          banned_by: string | null
          country_changes_this_month: number | null
          created_at: string
          id: string
          is_deactivated: boolean | null
          last_country_change: string | null
          last_username_change: string | null
          profile_border_style: string | null
          selected_clan: string | null
          selected_continent: string | null
          selected_flag: string | null
          updated_at: string
          user_id: string
          username: string
          username_changes_this_month: number | null
          username_color: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_color?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          banned_by?: string | null
          country_changes_this_month?: number | null
          created_at?: string
          id?: string
          is_deactivated?: boolean | null
          last_country_change?: string | null
          last_username_change?: string | null
          profile_border_style?: string | null
          selected_clan?: string | null
          selected_continent?: string | null
          selected_flag?: string | null
          updated_at?: string
          user_id: string
          username: string
          username_changes_this_month?: number | null
          username_color?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_color?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          banned_by?: string | null
          country_changes_this_month?: number | null
          created_at?: string
          id?: string
          is_deactivated?: boolean | null
          last_country_change?: string | null
          last_username_change?: string | null
          profile_border_style?: string | null
          selected_clan?: string | null
          selected_continent?: string | null
          selected_flag?: string | null
          updated_at?: string
          user_id?: string
          username?: string
          username_changes_this_month?: number | null
          username_color?: string | null
        }
        Relationships: []
      }
      stripe_user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: number | null
          current_period_start: number | null
          customer_id: string
          id: string
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id: string
          id?: string
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id?: string
          id?: string
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          analytics_enabled: boolean | null
          animations_enabled: boolean | null
          blur_enabled: boolean | null
          blur_intensity: number | null
          created_at: string
          font_family: string | null
          fps_display_enabled: boolean | null
          fullscreen_mode: boolean | null
          high_contrast_mode: boolean | null
          id: string
          image_quality: string | null
          network_stats_enabled: boolean | null
          notifications_enabled: boolean | null
          performance_mode: boolean | null
          profile_visibility: string | null
          server_region: string | null
          statistics_public: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          animations_enabled?: boolean | null
          blur_enabled?: boolean | null
          blur_intensity?: number | null
          created_at?: string
          font_family?: string | null
          fps_display_enabled?: boolean | null
          fullscreen_mode?: boolean | null
          high_contrast_mode?: boolean | null
          id?: string
          image_quality?: string | null
          network_stats_enabled?: boolean | null
          notifications_enabled?: boolean | null
          performance_mode?: boolean | null
          profile_visibility?: string | null
          server_region?: string | null
          statistics_public?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          animations_enabled?: boolean | null
          blur_enabled?: boolean | null
          blur_intensity?: number | null
          created_at?: string
          font_family?: string | null
          fps_display_enabled?: boolean | null
          fullscreen_mode?: boolean | null
          high_contrast_mode?: boolean | null
          id?: string
          image_quality?: string | null
          network_stats_enabled?: boolean | null
          notifications_enabled?: boolean | null
          performance_mode?: boolean | null
          profile_visibility?: string | null
          server_region?: string | null
          statistics_public?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          best_streak: number
          created_at: string
          daily_streak: number
          id: string
          last_played_date: string | null
          level: number
          multiplayer_wins: number
          time_mode_best_score: number
          total_correct_answers: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          best_streak?: number
          created_at?: string
          daily_streak?: number
          id?: string
          last_played_date?: string | null
          level?: number
          multiplayer_wins?: number
          time_mode_best_score?: number
          total_correct_answers?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          best_streak?: number
          created_at?: string
          daily_streak?: number
          id?: string
          last_played_date?: string | null
          level?: number
          multiplayer_wins?: number
          time_mode_best_score?: number
          total_correct_answers?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: {
        Args: { p_user_id: string; p_xp_gained: number }
        Returns: undefined
      }
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      generate_room_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_multiplayer_wins: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_best_streak: {
        Args: { p_streak: number; p_user_id: string }
        Returns: undefined
      }
      update_daily_streak: { Args: { p_user_id: string }; Returns: undefined }
      update_time_mode_score: {
        Args: { p_score: number; p_user_id: string }
        Returns: undefined
      }
      upsert_leaderboard_score: {
        Args: {
          p_details?: Json
          p_game_mode: string
          p_score: number
          p_user_id: string
        }
        Returns: boolean
      }
      user_is_in_lobby: { Args: { lobby_id_param: string }; Returns: boolean }
      user_is_in_match: { Args: { match_id_param: string }; Returns: boolean }
      user_is_match_participant: {
        Args: { match_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      clan_role:
        | "leader"
        | "vice_leader"
        | "elite_member"
        | "moderator"
        | "member"
        | "newbie"
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
    Enums: {
      app_role: ["admin", "user"],
      clan_role: [
        "leader",
        "vice_leader",
        "elite_member",
        "moderator",
        "member",
        "newbie",
      ],
    },
  },
} as const
