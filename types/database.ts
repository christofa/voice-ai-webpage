// Database schema types for Supabase
export type Database = {
  public: {
    Tables: {
      bots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          system_prompt: string;
          voice_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          system_prompt: string;
          voice_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          system_prompt?: string;
          voice_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          bot_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_bot_id_fkey";
            columns: ["bot_id"];
            isOneToOne: false;
            referencedRelation: "bots";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
