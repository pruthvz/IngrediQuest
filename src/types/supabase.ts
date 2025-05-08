// This file defines the types for the database tables
export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          category: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          user_id?: string;
        };
      };
      saved_recipes: {
        Row: {
          id: string;
          created_at: string;
          recipe_id: number;
          title: string;
          image: string;
          user_id: string;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          recipe_id: number;
          title: string;
          image: string;
          user_id: string;
          metadata?: any | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          recipe_id?: number;
          title?: string;
          image?: string;
          user_id?: string;
          metadata?: any | null;
        };
      };
      // Add other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
