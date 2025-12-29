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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hotstepper_audiobook_bookmarks: {
        Row: {
          chapter_id: number
          created_at: string | null
          id: string
          label: string | null
          timestamp_seconds: number
          user_id: string
        }
        Insert: {
          chapter_id: number
          created_at?: string | null
          id?: string
          label?: string | null
          timestamp_seconds: number
          user_id: string
        }
        Update: {
          chapter_id?: number
          created_at?: string | null
          id?: string
          label?: string | null
          timestamp_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      hotstepper_audiobook_progress: {
        Row: {
          chapter_id: number
          completed: boolean | null
          created_at: string | null
          id: string
          last_played_at: string | null
          progress_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id: number
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_played_at?: string | null
          progress_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: number
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_played_at?: string | null
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hotstepper_daily_steps: {
        Row: {
          active_minutes: number | null
          calories: number | null
          created_at: string | null
          data_source: string | null
          date: string
          distance_km: number | null
          id: string
          steps: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          calories?: number | null
          created_at?: string | null
          data_source?: string | null
          date?: string
          distance_km?: number | null
          id?: string
          steps?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          calories?: number | null
          created_at?: string | null
          data_source?: string | null
          date?: string
          distance_km?: number | null
          id?: string
          steps?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hotstepper_sessions: {
        Row: {
          avg_pace: number | null
          avg_speed: number | null
          created_at: string | null
          data_source: string | null
          distance_km: number | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          max_speed: number | null
          route_points: Json | null
          started_at: string | null
          steps: number | null
          user_id: string
        }
        Insert: {
          avg_pace?: number | null
          avg_speed?: number | null
          created_at?: string | null
          data_source?: string | null
          distance_km?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          max_speed?: number | null
          route_points?: Json | null
          started_at?: string | null
          steps?: number | null
          user_id: string
        }
        Update: {
          avg_pace?: number | null
          avg_speed?: number | null
          created_at?: string | null
          data_source?: string | null
          distance_km?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          max_speed?: number | null
          route_points?: Json | null
          started_at?: string | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      hotstepper_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_target_hit_date: string | null
          longest_streak: number | null
          total_days_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_target_hit_date?: string | null
          longest_streak?: number | null
          total_days_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_target_hit_date?: string | null
          longest_streak?: number | null
          total_days_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      masterclass_lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          interactive_config: Json | null
          interactive_type: string | null
          lesson_number: number
          module_name: string
          order_index: number
          subtitle_en_url: string | null
          subtitle_nl_url: string | null
          subtitle_ru_url: string | null
          title: string
          updated_at: string
          video_end_time: number | null
          video_start_time: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          interactive_config?: Json | null
          interactive_type?: string | null
          lesson_number: number
          module_name: string
          order_index?: number
          subtitle_en_url?: string | null
          subtitle_nl_url?: string | null
          subtitle_ru_url?: string | null
          title: string
          updated_at?: string
          video_end_time?: number | null
          video_start_time?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          interactive_config?: Json | null
          interactive_type?: string | null
          lesson_number?: number
          module_name?: string
          order_index?: number
          subtitle_en_url?: string | null
          subtitle_nl_url?: string | null
          subtitle_ru_url?: string | null
          title?: string
          updated_at?: string
          video_end_time?: number | null
          video_start_time?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string | null
          fats: number | null
          id: string
          image_url: string | null
          meal_name: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number | null
          created_at?: string | null
          fats?: number | null
          id?: string
          image_url?: string | null
          meal_name: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fats?: number | null
          id?: string
          image_url?: string | null
          meal_name?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          daily_calorie_goal: number | null
          daily_step_goal: number | null
          display_name: string | null
          height_cm: number | null
          hotstepper_onboarded: boolean | null
          id: string
          mission: string | null
          preferred_language: string | null
          resistance: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_step_goal?: number | null
          display_name?: string | null
          height_cm?: number | null
          hotstepper_onboarded?: boolean | null
          id?: string
          mission?: string | null
          preferred_language?: string | null
          resistance?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_step_goal?: number | null
          display_name?: string | null
          height_cm?: number | null
          hotstepper_onboarded?: boolean | null
          id?: string
          mission?: string | null
          preferred_language?: string | null
          resistance?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          options: Json | null
          order_number: number
          points: number | null
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          options?: Json | null
          order_number?: number
          points?: number | null
          question_text: string
          question_type?: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json | null
          order_number?: number
          points?: number | null
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "masterclass_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      standalone_quiz_options: {
        Row: {
          id: string
          is_correct: boolean | null
          label: string
          order_number: number | null
          question_id: string
          value: string
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          label: string
          order_number?: number | null
          question_id: string
          value: string
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          label?: string
          order_number?: number | null
          question_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "standalone_quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "standalone_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      standalone_quiz_questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          id: string
          order_number: number | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          order_number?: number | null
          points?: number | null
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          id?: string
          order_number?: number | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "standalone_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certificates: {
        Row: {
          certificate_number: string
          completed_at: string
          created_at: string
          id: string
          module_name: string
          score: number | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          completed_at?: string
          created_at?: string
          id?: string
          module_name: string
          score?: number | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          completed_at?: string
          created_at?: string
          id?: string
          module_name?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          interactive_responses: Json | null
          lesson_id: string
          quiz_score: number | null
          started_at: string | null
          updated_at: string
          user_id: string
          video_progress: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interactive_responses?: Json | null
          lesson_id: string
          quiz_score?: number | null
          started_at?: string | null
          updated_at?: string
          user_id: string
          video_progress?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          interactive_responses?: Json | null
          lesson_id?: string
          quiz_score?: number | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
          video_progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "masterclass_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id: string
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quiz_attempts: {
        Row: {
          completed_at: string | null
          id: string
          max_score: number | null
          quiz_id: string
          responses: Json | null
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          max_score?: number | null
          quiz_id: string
          responses?: Json | null
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          max_score?: number | null
          quiz_id?: string
          responses?: Json | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_full_briefing: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
