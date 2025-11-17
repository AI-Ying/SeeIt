// Supabase数据库类型定义
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: any;
        Insert: any;
        Update: any;
      };
      subcategories: {
        Row: any;
        Insert: any;
        Update: any;
      };
      items: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
  };
}