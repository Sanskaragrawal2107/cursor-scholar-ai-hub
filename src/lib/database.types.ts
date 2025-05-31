export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          role: "student" | "teacher";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role: "student" | "teacher";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "student" | "teacher";
          created_at?: string;
        };
      };
      classrooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          teacher_id: string;
          class_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          teacher_id: string;
          class_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          teacher_id?: string;
          class_code?: string;
          created_at?: string;
        };
      };
      classroom_members: {
        Row: {
          id: string;
          classroom_id: string;
          student_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          classroom_id: string;
          student_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          classroom_id?: string;
          student_id?: string;
          joined_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          classroom_id: string;
          title: string;
          description: string | null;
          subject_topic: string | null;
          file_url: string | null;
          file_path: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          classroom_id: string;
          title: string;
          description?: string | null;
          subject_topic?: string | null;
          file_url?: string | null;
          file_path?: string | null;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          classroom_id?: string;
          title?: string;
          description?: string | null;
          subject_topic?: string | null;
          file_url?: string | null;
          file_path?: string | null;
          due_date?: string | null;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          content_text: string | null;
          file_url: string | null;
          file_path: string | null;
          ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_feedback: Json | null;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          content_text?: string | null;
          file_url?: string | null;
          file_path?: string | null;
          ai_analysis_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_feedback?: Json | null;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          content_text?: string | null;
          file_url?: string | null;
          file_path?: string | null;
          ai_analysis_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          ai_feedback?: Json | null;
          submitted_at?: string | null;
        };
      };
      student_weak_topics: {
        Row: {
          id: string;
          student_id: string;
          assignment_id: string;
          topic_name: string | null;
          confidence_score: number | null;
          ai_explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          assignment_id: string;
          topic_name?: string | null;
          confidence_score?: number | null;
          ai_explanation?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          assignment_id?: string;
          topic_name?: string | null;
          confidence_score?: number | null;
          ai_explanation?: string | null;
          created_at?: string;
        };
      };
      personalized_recommendations: {
        Row: {
          id: string;
          student_id: string;
          topic_id: string;
          recommendation_type: 'youtube_video' | 'resource_link' | 'study_plan_item' | 'quiz' | null;
          title: string | null;
          description: string | null;
          url: string | null;
          details: Json | null;
          created_at: string;
          is_completed: boolean | null;
          student_weak_topic_id: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          topic_id: string;
          recommendation_type?: 'youtube_video' | 'resource_link' | 'study_plan_item' | 'quiz' | null;
          title?: string | null;
          description?: string | null;
          url?: string | null;
          details?: Json | null;
          created_at?: string;
          is_completed?: boolean | null;
          student_weak_topic_id?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          topic_id?: string;
          recommendation_type?: 'youtube_video' | 'resource_link' | 'study_plan_item' | 'quiz' | null;
          title?: string | null;
          description?: string | null;
          url?: string | null;
          details?: Json | null;
          created_at?: string;
          is_completed?: boolean | null;
          student_weak_topic_id?: string | null;
        };
      };
    };
  };
} 