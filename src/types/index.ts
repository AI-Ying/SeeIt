// 基础类型定义
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  category_id: string;
  subcategory_id?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_location?: string;
  quantity: number;
  tags?: string[];
  notes?: string;
  image_urls?: string[];
  ai_suggested_category_id?: string;
  ai_confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AICategorySuggestion {
  category_id: string;
  category_name: string;
  confidence: number;
  reasons: string[];
  alternatives?: Array<{
    category_id: string;
    category_name: string;
    confidence: number;
  }>;
}

export interface SearchFilters {
  query?: string;
  category_id?: string;
  category_ids?: string[];
  subcategory_id?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  price_range?: {
    min_price: number;
    max_price: number;
  };
  date_range?: {
    start_date: string;
    end_date: string;
  };
  tags?: string[];
  sort_by?: 'name' | 'purchase_date' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface AIPurchaseAdvice {
  item_id: string;
  advice: string;
  risk_level: 'low' | 'medium' | 'high';
  price_assessment: 'good' | 'fair' | 'expensive';
  similar_items: Array<{
    name: string;
    price: number;
    source: string;
  }>;
  market_trend: 'rising' | 'stable' | 'falling';
  confidence: number;
  type?: 'wait' | 'buy' | 'consider' | 'avoid';
}

export interface AISuggestion {
  id: string;
  type: 'category' | 'price' | 'trend' | 'purchase_advice' | 'duplicate_warning' | 'category_suggestion';
  title: string;
  description: string;
  confidence: number;
  item_ids?: string[];
  message?: string;
  data?: any;
  is_read?: boolean;
  created_at: string;
}