/**
 * API响应类型定义
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * 分页响应类型定义
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 上传响应类型定义
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

/**
 * 搜索响应类型定义
 */
export interface SearchResponse {
  items: any[];
  total: number;
  suggestions: string[];
  related_categories: string[];
  execution_time: number;
}

/**
 * AI分类建议响应类型定义
 */
export interface AICategorySuggestion {
  category_id: string;
  category_name: string;
  confidence: number;
  reasons: string[];
  alternatives: {
    category_id: string;
    category_name: string;
    confidence: number;
  }[];
}

/**
 * AI消费建议响应类型定义
 */
export interface AIPurchaseAdvice {
  type: 'wait' | 'buy' | 'consider' | 'avoid';
  confidence: number;
  reasons: string[];
  similar_items: {
    id: string;
    name: string;
    image_url: string;
    similarity_score: number;
  }[];
  alternatives: {
    name: string;
    reason: string;
    price_range?: {
      min: number;
      max: number;
    };
  }[];
  market_analysis?: {
    average_price: number;
    price_trend: 'up' | 'down' | 'stable';
    best_time_to_buy?: string;
  };
}