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
      app_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      beta_testers: {
        Row: {
          created_at: string
          feedback_provided: boolean | null
          id: string
          invitation_code: string
          registered_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_provided?: boolean | null
          id?: string
          invitation_code: string
          registered_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_provided?: boolean | null
          id?: string
          invitation_code?: string
          registered_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: Database["public"]["Enums"]["medical_specialty"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["medical_specialty"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["medical_specialty"]
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      flashcard_ratings: {
        Row: {
          created_at: string
          flashcard_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_ratings_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          flashcard_id: string
          id: string
          new_ease: number | null
          new_interval: number | null
          previous_ease: number | null
          previous_interval: number | null
          quality: number
          review_date: string
          user_id: string
        }
        Insert: {
          flashcard_id: string
          id?: string
          new_ease?: number | null
          new_interval?: number | null
          previous_ease?: number | null
          previous_interval?: number | null
          quality: number
          review_date?: string
          user_id: string
        }
        Update: {
          flashcard_id?: string
          id?: string
          new_ease?: number | null
          new_interval?: number | null
          previous_ease?: number | null
          previous_interval?: number | null
          quality?: number
          review_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sessions: {
        Row: {
          category: string | null
          created_at: string
          current_index: number
          flashcard_ids: string[]
          id: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_index?: number
          flashcard_ids?: string[]
          id?: string
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_index?: number
          flashcard_ids?: string[]
          id?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          answer_image_url: string | null
          category: string
          created_at: string | null
          ease_factor: number | null
          id: string
          interval: number | null
          is_practice: boolean | null
          is_public: boolean
          knowledge_state: string
          last_reviewed_at: string | null
          next_review_at: string | null
          question: string
          question_image_url: string | null
          review_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer: string
          answer_image_url?: string | null
          category: string
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval?: number | null
          is_practice?: boolean | null
          is_public?: boolean
          knowledge_state?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          question: string
          question_image_url?: string | null
          review_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          answer_image_url?: string | null
          category?: string
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval?: number | null
          is_practice?: boolean | null
          is_public?: boolean
          knowledge_state?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          question?: string
          question_image_url?: string | null
          review_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          specialty: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          specialty: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          topic_id: string
          updated_at: string
          vote_score: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          topic_id: string
          updated_at?: string
          vote_score?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          topic_id?: string
          updated_at?: string
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topic_votes: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_votes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string | null
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          title: string
          updated_at: string
          view_count: number
          vote_score: number | null
        }
        Insert: {
          author_id?: string | null
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          title: string
          updated_at?: string
          view_count?: number
          vote_score?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          title?: string
          updated_at?: string
          view_count?: number
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      library_topic_sections: {
        Row: {
          content: string[]
          heading: string | null
          id: string
          images: string[] | null
          order: number
          topic_id: string
        }
        Insert: {
          content?: string[]
          heading?: string | null
          id?: string
          images?: string[] | null
          order?: number
          topic_id: string
        }
        Update: {
          content?: string[]
          heading?: string | null
          id?: string
          images?: string[] | null
          order?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_topic_sections_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "library_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      library_topics: {
        Row: {
          created_at: string
          created_by: string
          id: string
          specialty: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          specialty: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          specialty?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notebook_entries: {
        Row: {
          ai_model_used: string | null
          content: string
          created_at: string
          generation_prompt: string | null
          id: string
          images: string[] | null
          notebook_id: string
          order_index: number
          source_id: string | null
          source_pdf_name: string | null
          source_type: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          content: string
          created_at?: string
          generation_prompt?: string | null
          id?: string
          images?: string[] | null
          notebook_id: string
          order_index?: number
          source_id?: string | null
          source_pdf_name?: string | null
          source_type?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          content?: string
          created_at?: string
          generation_prompt?: string | null
          id?: string
          images?: string[] | null
          notebook_id?: string
          order_index?: number
          source_id?: string | null
          source_pdf_name?: string | null
          source_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_entries_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "user_notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_trends: {
        Row: {
          accuracy_rate: number | null
          average_time: number | null
          created_at: string | null
          date_recorded: string
          id: string
          mode: string
          questions_answered: number | null
          specialty: string | null
          user_id: string
        }
        Insert: {
          accuracy_rate?: number | null
          average_time?: number | null
          created_at?: string | null
          date_recorded: string
          id?: string
          mode: string
          questions_answered?: number | null
          specialty?: string | null
          user_id: string
        }
        Update: {
          accuracy_rate?: number | null
          average_time?: number | null
          created_at?: string | null
          date_recorded?: string
          id?: string
          mode?: string
          questions_answered?: number | null
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
      poll_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          ip_address: unknown | null
          question_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          question_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_comments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          question_id: string
          selected_option_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          question_id: string
          selected_option_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          question_id?: string
          selected_option_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_quiz_questions: {
        Row: {
          order_index: number
          question_id: string
          quiz_id: string
        }
        Insert: {
          order_index: number
          question_id: string
          quiz_id: string
        }
        Update: {
          order_index?: number
          question_id?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_quiz_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "practice_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_quizzes: {
        Row: {
          configuration: Json | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_published: boolean
          is_sample: boolean
          time_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_published?: boolean
          is_sample?: boolean
          time_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_published?: boolean
          is_sample?: boolean
          time_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["medical_role"]
          updated_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          email?: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["medical_role"]
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["medical_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      question_feedback: {
        Row: {
          created_at: string
          email: string
          feedback: string
          id: string
          name: string
          question_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          feedback: string
          id?: string
          name: string
          question_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          feedback?: string
          id?: string
          name?: string
          question_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_of_the_week: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          published_at: string
          question_id: string
          title: string | null
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          question_id: string
          title?: string | null
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          question_id?: string
          title?: string | null
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_of_the_week_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          option_type: Database["public"]["Enums"]["question_option_type"]
          question_id: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_type: Database["public"]["Enums"]["question_option_type"]
          question_id: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option_type?: Database["public"]["Enums"]["question_option_type"]
          question_id?: string
          text?: string
          updated_at?: string
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
          created_at: string | null
          id: string
          ip_address: unknown | null
          question_id: string
          rating: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          question_id: string
          rating: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          question_id?: string
          rating?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          clinical_scenario: string | null
          correct_rationale: string | null
          created_at: string | null
          explanation: string | null
          id: string
          incorrect_rationales:
            | Database["public"]["CompositeTypes"]["rationale_type"][]
            | null
          metadata: Json | null
          reference_list: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["question_status"]
          submitted_by: string | null
          text: string
          updated_at: string | null
        }
        Insert: {
          clinical_scenario?: string | null
          correct_rationale?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_rationales?:
            | Database["public"]["CompositeTypes"]["rationale_type"][]
            | null
          metadata?: Json | null
          reference_list?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["question_status"]
          submitted_by?: string | null
          text: string
          updated_at?: string | null
        }
        Update: {
          clinical_scenario?: string | null
          correct_rationale?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          incorrect_rationales?:
            | Database["public"]["CompositeTypes"]["rationale_type"][]
            | null
          metadata?: Json | null
          reference_list?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["question_status"]
          submitted_by?: string | null
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions_categories: {
        Row: {
          category_id: string
          question_id: string
        }
        Insert: {
          category_id: string
          question_id: string
        }
        Update: {
          category_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_categories_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_review_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          created_at: string
          id: string
          questions_count: number
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          questions_count?: number
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          questions_count?: number
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          id: string
          mode: Database["public"]["Enums"]["quiz_mode"]
          quiz_id: string
          score: number | null
          started_at: string | null
          status: string | null
          time_spent: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mode: Database["public"]["Enums"]["quiz_mode"]
          quiz_id: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["quiz_mode"]
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_practice_quizzes"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "practice_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_progress: {
        Row: {
          answers: Json | null
          attempt_id: string | null
          created_at: string
          current_question_index: number | null
          id: string
          mode: string | null
          progress_at: string
          quiz_completed: boolean
          quiz_id: string
          show_submit_screen: boolean
          time_remaining: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_id?: string | null
          created_at?: string
          current_question_index?: number | null
          id?: string
          mode?: string | null
          progress_at?: string
          quiz_completed?: boolean
          quiz_id: string
          show_submit_screen?: boolean
          time_remaining?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempt_id?: string | null
          created_at?: string
          current_question_index?: number | null
          id?: string
          mode?: string | null
          progress_at?: string
          quiz_completed?: boolean
          quiz_id?: string
          show_submit_screen?: boolean
          time_remaining?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      specialty_performance: {
        Row: {
          correct_answers: number | null
          id: string
          last_attempt_at: string | null
          specialty: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          correct_answers?: number | null
          id?: string
          last_attempt_at?: string | null
          specialty: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          correct_answers?: number | null
          id?: string
          last_attempt_at?: string | null
          specialty?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      study_group_bookmarks: {
        Row: {
          created_at: string
          group_id: string
          id: string
          note: string | null
          question_id: string
          shared_by: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          note?: string | null
          question_id: string
          shared_by: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          note?: string | null
          question_id?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_bookmarks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          is_active: boolean
          max_members: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_members?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_members?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      upload_templates: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answer_changed: boolean | null
          answer_changes: number | null
          answered_at: string | null
          attempt_id: string
          id: string
          is_correct: boolean | null
          is_marked: boolean | null
          question_id: string
          question_order: number | null
          selected_option: string | null
          skipped: boolean | null
          time_spent: number | null
          time_to_answer: number | null
        }
        Insert: {
          answer_changed?: boolean | null
          answer_changes?: number | null
          answered_at?: string | null
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          is_marked?: boolean | null
          question_id: string
          question_order?: number | null
          selected_option?: string | null
          skipped?: boolean | null
          time_spent?: number | null
          time_to_answer?: number | null
        }
        Update: {
          answer_changed?: boolean | null
          answer_changes?: number | null
          answered_at?: string | null
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          is_marked?: boolean | null
          question_id?: string
          question_order?: number | null
          selected_option?: string | null
          skipped?: boolean | null
          time_spent?: number | null
          time_to_answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_quiz_attempts_view"
            referencedColumns: ["attempt_id"]
          },
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_usage: {
        Row: {
          created_at: string
          date: string
          id: string
          questions_answered: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          questions_answered?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          questions_answered?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notebooks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean
          specialty: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          specialty: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          specialty?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_performance_analytics: {
        Row: {
          average_time_per_question: number | null
          correct_answers: number | null
          created_at: string | null
          fastest_correct_answer: number | null
          id: string
          improvement_rate: number | null
          incorrect_answers: number | null
          last_calculated_at: string | null
          overall_accuracy: number | null
          questions_reviewed: number | null
          streak_current: number | null
          streak_longest: number | null
          timed_mode_accuracy: number | null
          total_questions_answered: number | null
          total_questions_available: number | null
          tutor_mode_accuracy: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_time_per_question?: number | null
          correct_answers?: number | null
          created_at?: string | null
          fastest_correct_answer?: number | null
          id?: string
          improvement_rate?: number | null
          incorrect_answers?: number | null
          last_calculated_at?: string | null
          overall_accuracy?: number | null
          questions_reviewed?: number | null
          streak_current?: number | null
          streak_longest?: number | null
          timed_mode_accuracy?: number | null
          total_questions_answered?: number | null
          total_questions_available?: number | null
          tutor_mode_accuracy?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_time_per_question?: number | null
          correct_answers?: number | null
          created_at?: string | null
          fastest_correct_answer?: number | null
          id?: string
          improvement_rate?: number | null
          incorrect_answers?: number | null
          last_calculated_at?: string | null
          overall_accuracy?: number | null
          questions_reviewed?: number | null
          streak_current?: number | null
          streak_longest?: number | null
          timed_mode_accuracy?: number | null
          total_questions_answered?: number | null
          total_questions_available?: number | null
          tutor_mode_accuracy?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_performance_history: {
        Row: {
          average_score: number
          average_time_per_question: number | null
          correct_answers: number
          id: string
          incorrect_answers: number
          recorded_at: string
          specialty: string | null
          user_id: string
        }
        Insert: {
          average_score?: number
          average_time_per_question?: number | null
          correct_answers?: number
          id?: string
          incorrect_answers?: number
          recorded_at?: string
          specialty?: string | null
          user_id: string
        }
        Update: {
          average_score?: number
          average_time_per_question?: number | null
          correct_answers?: number
          id?: string
          incorrect_answers?: number
          recorded_at?: string
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_private_questions: {
        Row: {
          created_at: string
          id: string
          question_data: Json
          source_pdf_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_data: Json
          source_pdf_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_data?: Json
          source_pdf_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_private_quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_attempted_at: string | null
          question_ids: string[]
          source_pdf_name: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_attempted_at?: string | null
          question_ids?: string[]
          source_pdf_name: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_attempted_at?: string | null
          question_ids?: string[]
          source_pdf_name?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_question_status: {
        Row: {
          bookmark_notes: string | null
          id: string
          is_marked: boolean | null
          is_used: boolean | null
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmark_notes?: string | null
          id?: string
          is_marked?: boolean | null
          is_used?: boolean | null
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmark_notes?: string | null
          id?: string
          is_marked?: boolean | null
          is_used?: boolean | null
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_status_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_attempted_at: string | null
          mode: string
          quiz_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_attempted_at?: string | null
          mode?: string
          quiz_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_attempted_at?: string | null
          mode?: string
          quiz_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quizzes_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "practice_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ranking_data: {
        Row: {
          accuracy_percentile: number | null
          calculated_at: string | null
          consistency_percentile: number | null
          created_at: string | null
          id: string
          median_score: number | null
          overall_percentile: number | null
          rank_position: number | null
          speed_percentile: number | null
          total_users_ranked: number | null
          user_id: string
        }
        Insert: {
          accuracy_percentile?: number | null
          calculated_at?: string | null
          consistency_percentile?: number | null
          created_at?: string | null
          id?: string
          median_score?: number | null
          overall_percentile?: number | null
          rank_position?: number | null
          speed_percentile?: number | null
          total_users_ranked?: number | null
          user_id: string
        }
        Update: {
          accuracy_percentile?: number | null
          calculated_at?: string | null
          consistency_percentile?: number | null
          created_at?: string | null
          id?: string
          median_score?: number | null
          overall_percentile?: number | null
          rank_position?: number | null
          speed_percentile?: number | null
          total_users_ranked?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          user_name: string
          user_specialty: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
          user_specialty: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          user_specialty?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_statistics: {
        Row: {
          average_score: number | null
          correct_answers: number | null
          created_at: string | null
          id: string
          incorrect_answers: number | null
          total_quizzes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          total_quizzes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          total_quizzes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      flashcard_average_ratings: {
        Row: {
          average_rating: number | null
          flashcard_id: string | null
          rating_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_ratings_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      global_specialty_performance: {
        Row: {
          average_score: number | null
          specialty: string | null
          total_available_questions: number | null
          total_correct_answers: number | null
          total_questions_attempted: number | null
          user_count: number | null
        }
        Relationships: []
      }
      global_specialty_stats_view: {
        Row: {
          average_score: number | null
          specialty: string | null
          total_correct_answers: number | null
          total_questions: number | null
          user_count: number | null
        }
        Relationships: []
      }
      question_usage_stats: {
        Row: {
          marked_questions: number | null
          normalized_specialty: string | null
          original_specialty:
            | Database["public"]["Enums"]["medical_specialty"]
            | null
          total_questions: number | null
          untracked_questions: number | null
          unused_questions: number | null
          used_questions: number | null
        }
        Relationships: []
      }
      user_analytics_dashboard: {
        Row: {
          accuracy_percentile: number | null
          average_time_per_question: number | null
          correct_answers: number | null
          improvement_rate: number | null
          incorrect_answers: number | null
          last_calculated_at: string | null
          median_score: number | null
          overall_accuracy: number | null
          overall_percentile: number | null
          questions_remaining: number | null
          questions_reviewed: number | null
          rank_position: number | null
          speed_percentile: number | null
          streak_current: number | null
          streak_longest: number | null
          timed_mode_accuracy: number | null
          total_questions_answered: number | null
          total_questions_available: number | null
          total_users_ranked: number | null
          tutor_mode_accuracy: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_answers_summary_view: {
        Row: {
          answer_id: string | null
          answered_at: string | null
          attempt_id: string | null
          category_id: string | null
          is_correct: boolean | null
          question_id: string | null
          question_text: string | null
          question_time_spent: number | null
          selected_option: string | null
          skipped: boolean | null
          specialty: Database["public"]["Enums"]["medical_specialty"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_quiz_attempts_view"
            referencedColumns: ["attempt_id"]
          },
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_percentile_stats: {
        Row: {
          average_score: number | null
          percentile: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_quiz_attempts_view: {
        Row: {
          attempt_id: string | null
          completed_at: string | null
          mode: Database["public"]["Enums"]["quiz_mode"] | null
          quiz_created_at: string | null
          quiz_description: string | null
          quiz_id: string | null
          quiz_title: string | null
          score: number | null
          specialty: Database["public"]["Enums"]["medical_specialty"] | null
          started_at: string | null
          status: string | null
          time_spent: number | null
          total_questions: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_practice_quizzes"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "practice_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_specialty_stats_view: {
        Row: {
          correct_answers: number | null
          last_attempt_at: string | null
          percentage: number | null
          specialty: string | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          correct_answers?: number | null
          last_attempt_at?: string | null
          percentage?: never
          specialty?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          correct_answers?: number | null
          last_attempt_at?: string | null
          percentage?: never
          specialty?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bulk_upload_questions: {
        Args: { _questions: Json; _user_id: string }
        Returns: {
          success: boolean
          question_id: string
          error_message: string
        }[]
      }
      calculate_user_performance_analytics: {
        Args: { _user_id: string }
        Returns: undefined
      }
      calculate_user_rankings: {
        Args: { _user_id: string }
        Returns: undefined
      }
      can_submit_question: {
        Args: { user_id: string }
        Returns: boolean
      }
      can_submit_specialty_question: {
        Args: { user_id: string; specialty_name: string }
        Returns: boolean
      }
      check_admin_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      fetch_quiz_questions: {
        Args: {
          _specialties: string[]
          _count: number
          _user_id?: string
          _filter?: string
        }
        Returns: {
          id: string
          text: string
          explanation: string
          metadata: Json
          options: Json
          specialty: string
        }[]
      }
      fetch_user_incorrect_answers: {
        Args: { _user_id: string; _limit?: number; _days_back?: number }
        Returns: {
          question_id: string
          incorrect_count: number
          last_incorrect_at: string
          specialty: string
        }[]
      }
      fetch_user_private_quiz_questions: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: {
          question_id: string
          question_data: Json
        }[]
      }
      get_active_users_count: {
        Args: { _days?: number }
        Returns: number
      }
      get_archived_questions_of_week: {
        Args: { _limit?: number; _offset?: number }
        Returns: {
          id: string
          question_id: string
          title: string
          description: string
          week_number: number
          year: number
          published_at: string
          question_text: string
          question_explanation: string
          question_metadata: Json
          options: Json
        }[]
      }
      get_beta_testing_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_comprehensive_specialty_stats: {
        Args: { _user_id?: string }
        Returns: {
          specialty: string
          global_average_score: number
          user_score: number
          user_correct: number
          user_total: number
          total_available_questions: number
          user_count: number
          total_attempts: number
          difficulty_rank: number
        }[]
      }
      get_current_question_of_week: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          question_id: string
          title: string
          description: string
          week_number: number
          year: number
          published_at: string
          question_text: string
          question_explanation: string
          question_metadata: Json
          options: Json
        }[]
      }
      get_daily_question_count: {
        Args: { user_id: string; target_date?: string }
        Returns: number
      }
      get_forum_category_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_id: string
          category_name: string
          category_description: string
          specialty: string
          topic_count: number
          post_count: number
          active_users: number
          latest_activity: string
          latest_topic_title: string
          latest_topic_author: string
          trending_score: number
        }[]
      }
      get_forum_posts_for_topic: {
        Args: { topic_id_param: string }
        Returns: {
          id: string
          topic_id: string
          parent_id: string
          content: string
          author_id: string
          author_name: string
          vote_score: number
          reply_count: number
          created_at: string
          updated_at: string
        }[]
      }
      get_forum_topics_with_stats: {
        Args: { category_id_param: string }
        Returns: {
          id: string
          category_id: string
          title: string
          content: string
          author_id: string
          author_name: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          vote_score: number
          reply_count: number
          created_at: string
          updated_at: string
          last_activity: string
        }[]
      }
      get_poll_comments: {
        Args: { poll_question_id: string }
        Returns: {
          id: string
          comment_text: string
          created_at: string
        }[]
      }
      get_poll_results: {
        Args: { poll_question_id: string }
        Returns: {
          option_id: string
          option_text: string
          option_type: string
          response_count: number
          percentage: number
        }[]
      }
      get_question_status_counts: {
        Args: { _user_id: string }
        Returns: {
          specialty: string
          total_count: number
          used_count: number
          unused_count: number
          marked_count: number
        }[]
      }
      get_quiz_specialties: {
        Args: { _quiz_id: string }
        Returns: {
          specialty: string
        }[]
      }
      get_total_specialty_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          specialty: string
          total_count: number
        }[]
      }
      get_user_bookmark_stats: {
        Args: { _user_id: string }
        Returns: {
          total_bookmarks: number
          bookmarks_by_specialty: Json
        }[]
      }
      get_user_private_quiz_with_questions: {
        Args: { _quiz_id: string; _user_id: string }
        Returns: Json
      }
      get_user_question_count: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_specialty_percentiles: {
        Args: { _user_id: string }
        Returns: {
          specialty: string
          user_score: number
          user_correct: number
          user_total: number
          global_average: number
          percentile: number
          total_users_in_specialty: number
          user_rank: number
        }[]
      }
      get_user_specialty_question_count: {
        Args: { user_id: string; specialty_name: string }
        Returns: number
      }
      get_user_vote_status: {
        Args: { _user_id: string; _content_id: string; _content_type: string }
        Returns: number
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_user_voted: {
        Args: { poll_question_id: string; user_ip: unknown }
        Returns: boolean
      }
      increment_daily_question_count: {
        Args: { user_id: string; increment_by?: number }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      normalize_specialty_name: {
        Args: { input_specialty: string }
        Returns: string
      }
      rate_flashcard: {
        Args: { _flashcard_id: string; _rating: number }
        Returns: boolean
      }
      remove_vote: {
        Args: { _user_id: string; _content_id: string; _content_type: string }
        Returns: undefined
      }
      reset_user_statistics: {
        Args: { _user_id: string }
        Returns: undefined
      }
      track_quiz_completion: {
        Args:
          | {
              _quiz_id: string
              _user_id: string
              _correct_count: number
              _total_questions: number
              _specialty: string
            }
          | {
              _quiz_id: string
              _user_id: string
              _correct_count: number
              _total_questions: number
              _specialty: string
              _time_spent?: number
            }
        Returns: undefined
      }
      update_beta_testing_status: {
        Args: { _settings: Json; _user_id: string }
        Returns: boolean
      }
      update_user_statistics: {
        Args: {
          _user_id: string
          _correct_count: number
          _total_questions: number
          _specialty: string
        }
        Returns: undefined
      }
      update_user_statistics_extended: {
        Args: {
          _user_id: string
          _correct_count: number
          _total_questions: number
          _specialty: string
          _time_spent?: number
        }
        Returns: undefined
      }
      vote_on_post: {
        Args: { _post_id: string; _user_id: string; _vote_type: number }
        Returns: undefined
      }
      vote_on_topic: {
        Args: { _topic_id: string; _user_id: string; _vote_type: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      medical_role:
        | "Attending"
        | "Resident"
        | "Fellow"
        | "Medical Student"
        | "Other"
      medical_specialty:
        | "Cardiology"
        | "Endocrinology"
        | "Gastroenterology"
        | "Hematology"
        | "Infectious Disease"
        | "Nephrology"
        | "Oncology"
        | "Pulmonology"
        | "Rheumatology"
        | "Geriatrics"
        | "Allergy and Immunology"
        | "Hospital Medicine"
        | "Primary Care"
        | "Neurology"
        | "Dermatology"
        | "Epidemiology"
        | "Obstetrics and Gynecology"
        | "Ophthalmology"
        | "General Medicine"
        | "Obstetrics"
        | "ENT"
      question_option_type: "correct" | "incorrect"
      question_status: "draft" | "approved" | "rejected"
      quiz_mode: "tutor" | "timed"
      subscription_tier: "free" | "monthly" | "semi_annual" | "beta_tester"
    }
    CompositeTypes: {
      rationale_type: {
        answer_text: string | null
        explanation: string | null
      }
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
      medical_role: [
        "Attending",
        "Resident",
        "Fellow",
        "Medical Student",
        "Other",
      ],
      medical_specialty: [
        "Cardiology",
        "Endocrinology",
        "Gastroenterology",
        "Hematology",
        "Infectious Disease",
        "Nephrology",
        "Oncology",
        "Pulmonology",
        "Rheumatology",
        "Geriatrics",
        "Allergy and Immunology",
        "Hospital Medicine",
        "Primary Care",
        "Neurology",
        "Dermatology",
        "Epidemiology",
        "Obstetrics and Gynecology",
        "Ophthalmology",
        "General Medicine",
        "Obstetrics",
        "ENT",
      ],
      question_option_type: ["correct", "incorrect"],
      question_status: ["draft", "approved", "rejected"],
      quiz_mode: ["tutor", "timed"],
      subscription_tier: ["free", "monthly", "semi_annual", "beta_tester"],
    },
  },
} as const
