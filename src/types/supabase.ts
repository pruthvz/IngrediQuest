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
