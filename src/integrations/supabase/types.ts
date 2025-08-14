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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          color: string
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_post_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_forum_post_replies_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_forum_post_replies_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_post_replies_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players_secure"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_post_replies_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_upvotes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_forum_post_upvotes_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_forum_post_upvotes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_post_upvotes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players_secure"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_post_upvotes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string
          title: string
          updated_at: string
          upvote_count: number
          user_id: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          title: string
          updated_at?: string
          upvote_count?: number
          user_id: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          title?: string
          updated_at?: string
          upvote_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_forum_posts_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_forum_posts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_posts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_players_secure"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_forum_posts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      game_room_players: {
        Row: {
          id: string
          is_active: boolean
          is_host: boolean
          joined_at: string
          player_name: string
          room_id: string
          score: number
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          is_host?: boolean
          joined_at?: string
          player_name: string
          room_id: string
          score?: number
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          is_host?: boolean
          joined_at?: string
          player_name?: string
          room_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_room_questions: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          id: string
          is_answered: boolean
          question_id: string
          room_id: string
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          id?: string
          is_answered?: boolean
          question_id: string
          room_id: string
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          id?: string
          is_answered?: boolean
          question_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_room_questions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string
          current_player_count: number
          current_turn_user_id: string | null
          finished_at: string | null
          game_config: Json
          host_user_id: string
          id: string
          max_players: number
          room_code: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          current_player_count?: number
          current_turn_user_id?: string | null
          finished_at?: string | null
          game_config: Json
          host_user_id: string
          id?: string
          max_players?: number
          room_code: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          current_player_count?: number
          current_turn_user_id?: string | null
          finished_at?: string | null
          game_config?: Json
          host_user_id?: string
          id?: string
          max_players?: number
          room_code?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      matchmaking_requests: {
        Row: {
          created_at: string
          expires_at: string
          game_config: Json
          id: string
          requester_id: string
          status: string
          target_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          game_config: Json
          id?: string
          requester_id: string
          status?: string
          target_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          game_config?: Json
          id?: string
          requester_id?: string
          status?: string
          target_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_admin: boolean
          last_seen: string | null
          player_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_admin?: boolean
          last_seen?: string | null
          player_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_admin?: boolean
          last_seen?: string | null
          player_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          option_type: string
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_type: string
          question_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          option_type?: string
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_ratings: {
        Row: {
          created_at: string
          id: string
          question_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_ratings_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          average_rating: number | null
          category_id: string
          created_at: string
          created_by: string | null
          explanation: string | null
          flagged_at: string | null
          has_image: boolean
          historical_context: string | null
          id: string
          image_url: string | null
          is_flagged: boolean | null
          points: number
          reviewed_at: string | null
          reviewed_by: string | null
          text: string
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          category_id: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          flagged_at?: string | null
          has_image?: boolean
          historical_context?: string | null
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          points?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          text: string
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          category_id?: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          flagged_at?: string | null
          has_image?: boolean
          historical_context?: string | null
          id?: string
          image_url?: string | null
          is_flagged?: boolean | null
          points?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          text?: string
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_games: {
        Row: {
          categories_played: string[]
          completed_at: string
          created_at: string
          final_score: number
          game_duration_seconds: number | null
          game_mode: string
          id: string
          questions_answered: number
          questions_correct: number
          user_id: string
        }
        Insert: {
          categories_played?: string[]
          completed_at?: string
          created_at?: string
          final_score?: number
          game_duration_seconds?: number | null
          game_mode: string
          id?: string
          questions_answered?: number
          questions_correct?: number
          user_id: string
        }
        Update: {
          categories_played?: string[]
          completed_at?: string
          created_at?: string
          final_score?: number
          game_duration_seconds?: number | null
          game_mode?: string
          id?: string
          questions_answered?: number
          questions_correct?: number
          user_id?: string
        }
        Relationships: []
      }
      user_question_attempts: {
        Row: {
          answered_correctly: boolean
          attempted_at: string
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          answered_correctly: boolean
          attempted_at?: string
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          answered_correctly?: boolean
          attempted_at?: string
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          best_game_score: number
          created_at: string
          current_correct_streak: number
          id: string
          longest_correct_streak: number
          total_games_played: number
          total_points_earned: number
          total_questions_answered: number
          total_questions_correct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_game_score?: number
          created_at?: string
          current_correct_streak?: number
          id?: string
          longest_correct_streak?: number
          total_games_played?: number
          total_points_earned?: number
          total_questions_answered?: number
          total_questions_correct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_game_score?: number
          created_at?: string
          current_correct_streak?: number
          id?: string
          longest_correct_streak?: number
          total_games_played?: number
          total_points_earned?: number
          total_questions_answered?: number
          total_questions_correct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      online_players: {
        Row: {
          display_name: string | null
          email: string | null
          is_online: boolean | null
          last_seen: string | null
          player_status: string | null
          user_id: string | null
        }
        Insert: {
          display_name?: string | null
          email?: string | null
          is_online?: never
          last_seen?: string | null
          player_status?: string | null
          user_id?: string | null
        }
        Update: {
          display_name?: string | null
          email?: string | null
          is_online?: never
          last_seen?: string | null
          player_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      online_players_secure: {
        Row: {
          display_name: string | null
          is_online: boolean | null
          last_seen: string | null
          player_status: string | null
          user_id: string | null
        }
        Insert: {
          display_name?: string | null
          is_online?: never
          last_seen?: string | null
          player_status?: string | null
          user_id?: string | null
        }
        Update: {
          display_name?: string | null
          is_online?: never
          last_seen?: string | null
          player_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      cleanup_expired_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: { user_email: string; user_password: string }
        Returns: string
      }
      find_waiting_players: {
        Args: { exclude_user_id?: string }
        Returns: {
          display_name: string
          email: string
          last_seen: string
          user_id: string
        }[]
      }
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_forum_author_info: {
        Args: { author_user_id: string }
        Returns: {
          display_name: string
          email: string
          user_id: string
        }[]
      }
      get_single_player_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          best_category_name: string
          best_category_points: number
          email: string
          total_games_vs_computer: number
          total_points_vs_computer: number
          user_id: string
        }[]
      }
      get_user_email_for_moderation: {
        Args: { target_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_uuid?: string }
        Returns: boolean
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      make_user_admin_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      update_player_status: {
        Args: { new_status: string }
        Returns: undefined
      }
      update_question_rating_stats: {
        Args: { question_uuid: string }
        Returns: undefined
      }
      update_user_correct_streak: {
        Args: { p_is_correct: boolean; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
