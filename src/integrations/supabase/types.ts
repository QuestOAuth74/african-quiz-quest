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
      admin_action_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          request_payload: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          request_payload?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          request_payload?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: Json
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          pdf_attachment_name: string | null
          pdf_attachment_url: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: Json
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          pdf_attachment_name?: string | null
          pdf_attachment_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: Json
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          pdf_attachment_name?: string | null
          pdf_attachment_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
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
      crossword_game_states: {
        Row: {
          created_at: string
          game_state: Json
          hints_used: number
          id: string
          is_completed: boolean
          puzzle_id: string
          score: number
          time_elapsed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_state: Json
          hints_used?: number
          id?: string
          is_completed?: boolean
          puzzle_id: string
          score?: number
          time_elapsed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_state?: Json
          hints_used?: number
          id?: string
          is_completed?: boolean
          puzzle_id?: string
          score?: number
          time_elapsed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crossword_game_states_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "crossword_puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      crossword_puzzles: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          difficulty: number
          grid_data: Json
          id: string
          is_active: boolean
          title: string
          updated_at: string
          words_data: Json
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          difficulty?: number
          grid_data: Json
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          words_data: Json
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          difficulty?: number
          grid_data?: Json
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          words_data?: Json
        }
        Relationships: []
      }
      crossword_word_usage: {
        Row: {
          created_at: string
          id: string
          puzzle_id: string | null
          used_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          puzzle_id?: string | null
          used_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string
          id?: string
          puzzle_id?: string | null
          used_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      crossword_words: {
        Row: {
          category: string
          clue: string
          created_at: string
          difficulty: number
          id: string
          is_active: boolean
          length: number | null
          updated_at: string
          word: string
        }
        Insert: {
          category: string
          clue: string
          created_at?: string
          difficulty?: number
          id?: string
          is_active?: boolean
          length?: number | null
          updated_at?: string
          word: string
        }
        Update: {
          category?: string
          clue?: string
          created_at?: string
          difficulty?: number
          id?: string
          is_active?: boolean
          length?: number | null
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled_for_admins: boolean
          enabled_for_public: boolean
          feature_name: string
          id: string
          rollout_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled_for_admins?: boolean
          enabled_for_public?: boolean
          feature_name: string
          id?: string
          rollout_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled_for_admins?: boolean
          enabled_for_public?: boolean
          feature_name?: string
          id?: string
          rollout_date?: string | null
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
      message_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
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
      user_orbs: {
        Row: {
          created_at: string
          id: string
          orbs_from_posts: number
          orbs_from_quiz_points: number
          orbs_from_replies: number
          pdf_claimed: boolean
          pdf_claimed_at: string | null
          total_orbs: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          orbs_from_posts?: number
          orbs_from_quiz_points?: number
          orbs_from_replies?: number
          pdf_claimed?: boolean
          pdf_claimed_at?: string | null
          total_orbs?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          orbs_from_posts?: number
          orbs_from_quiz_points?: number
          orbs_from_replies?: number
          pdf_claimed?: boolean
          pdf_claimed_at?: string | null
          total_orbs?: number
          updated_at?: string
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
      wheel_game_challenges: {
        Row: {
          challenged_id: string
          challenger_id: string
          created_at: string
          expires_at: string
          game_config: Json
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          challenged_id: string
          challenger_id: string
          created_at?: string
          expires_at?: string
          game_config?: Json
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          challenged_id?: string
          challenger_id?: string
          created_at?: string
          expires_at?: string
          game_config?: Json
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      wheel_game_moves: {
        Row: {
          created_at: string
          id: string
          move_data: Json
          move_type: string
          player_id: string
          points_earned: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          move_data?: Json
          move_type: string
          player_id: string
          points_earned?: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          move_data?: Json
          move_type?: string
          player_id?: string
          points_earned?: number
          session_id?: string
        }
        Relationships: []
      }
      wheel_game_sessions: {
        Row: {
          computer_difficulty: string | null
          computer_player_data: Json | null
          created_at: string
          current_player: number
          current_puzzle_id: string | null
          game_mode: string
          game_state: Json
          id: string
          player1_id: string
          player1_name: string | null
          player1_round_score: number
          player1_score: number
          player2_id: string | null
          player2_name: string | null
          player2_round_score: number
          player2_score: number
          rounds_won_player1: number
          rounds_won_player2: number
          status: string
          updated_at: string
        }
        Insert: {
          computer_difficulty?: string | null
          computer_player_data?: Json | null
          created_at?: string
          current_player?: number
          current_puzzle_id?: string | null
          game_mode?: string
          game_state?: Json
          id?: string
          player1_id: string
          player1_name?: string | null
          player1_round_score?: number
          player1_score?: number
          player2_id?: string | null
          player2_name?: string | null
          player2_round_score?: number
          player2_score?: number
          rounds_won_player1?: number
          rounds_won_player2?: number
          status?: string
          updated_at?: string
        }
        Update: {
          computer_difficulty?: string | null
          computer_player_data?: Json | null
          created_at?: string
          current_player?: number
          current_puzzle_id?: string | null
          game_mode?: string
          game_state?: Json
          id?: string
          player1_id?: string
          player1_name?: string | null
          player1_round_score?: number
          player1_score?: number
          player2_id?: string | null
          player2_name?: string | null
          player2_round_score?: number
          player2_score?: number
          rounds_won_player1?: number
          rounds_won_player2?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      wheel_puzzles: {
        Row: {
          category: string
          created_at: string
          difficulty: number
          hint: string | null
          id: string
          is_active: boolean
          phrase: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty?: number
          hint?: string | null
          id?: string
          is_active?: boolean
          phrase: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: number
          hint?: string | null
          id?: string
          is_active?: boolean
          phrase?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      online_players: {
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
      advance_room_turn: {
        Args: { p_room_id: string }
        Returns: string
      }
      calculate_reading_time: {
        Args: { content: Json }
        Returns: number
      }
      calculate_user_orbs: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_admin_rate_limit: {
        Args: {
          p_action_type: string
          p_max_actions?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      cleanup_expired_requests: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_wheel_challenges: {
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
      fix_room_player_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_room_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { title: string }
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
      get_online_players: {
        Args: Record<PropertyKey, never>
        Returns: {
          display_name: string
          is_online: boolean
          last_seen: string
          player_status: string
          user_id: string
        }[]
      }
      get_or_create_thread: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_recent_admin_activity: {
        Args: { p_limit?: number }
        Returns: {
          action_type: string
          created_at: string
          display_name: string
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }[]
      }
      get_single_player_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          best_category_name: string
          best_category_points: number
          display_name: string
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
      increment_view_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_uuid?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_request_payload?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: string
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
