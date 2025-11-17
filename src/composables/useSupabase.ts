import { supabase } from '@/utils/supabase';
import { createSimpleAICategoryService } from '@/utils/simpleAICategoryService';
import type { Item, Category, Subcategory, SearchFilters } from '@/types';

/**
 * 物品服务
 */
export const itemService = {
  /**
   * 创建物品
   */
  async createItem(itemData: Partial<Item>): Promise<Item> {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single();

      if (error) {
        console.error('创建物品失败 - Supabase错误:', error);
        throw new Error(`创建物品失败: ${error.message}`);
      }

      if (!data) {
        throw new Error('创建物品失败: 没有返回数据');
      }

      return data;
    } catch (error) {
      console.error('创建物品失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户物品列表
   */
  async getUserItems(userId: string, page = 1, pageSize = 20): Promise<{ items: Item[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { items: data || [], total: count || 0 };
  },

  /**
   * 搜索物品
   */
  async searchItems(userId: string, query: string, filters?: SearchFilters): Promise<Item[]> {
    let searchQuery = supabase
      .from('items')
      .select('*')
      .eq('user_id', userId);

    // 文本搜索
    if (query) {
      searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
    }

    // 分类过滤
    if (filters?.category_ids && filters.category_ids.length > 0) {
      searchQuery = searchQuery.in('category_id', filters.category_ids);
    }

    // 日期范围过滤
    if (filters?.date_range) {
      searchQuery = searchQuery
        .gte('purchase_date', filters.date_range.start_date)
        .lte('purchase_date', filters.date_range.end_date);
    }

    // 价格范围过滤
    if (filters?.price_range) {
      searchQuery = searchQuery
        .gte('purchase_price', filters.price_range.min_price)
        .lte('purchase_price', filters.price_range.max_price);
    }

    // 状态过滤
    if (filters?.condition) {
      searchQuery = searchQuery.eq('condition', filters.condition);
    }

    // 标签过滤
    if (filters?.tags && filters.tags.length > 0) {
      searchQuery = searchQuery.contains('tags', filters.tags);
    }

    const { data, error } = await searchQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * 更新物品
   */
  async updateItem(itemId: string, updates: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除物品
   */
  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * 获取相似物品
   */
  async getSimilarItems(itemId: string, limit = 5): Promise<Item[]> {
    // 这里可以实现基于内容的相似度算法
    // 暂时返回同分类的物品
    const { data: currentItem, error: currentError } = await supabase
      .from('items')
      .select('category_id, tags')
      .eq('id', itemId)
      .single();

    if (currentError) throw currentError;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', currentItem.category_id)
      .neq('id', itemId)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

/**
 * 分类服务
 */
export const categoryService = {
  /**
   * 获取所有分类
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取分类失败: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('没有找到可用的分类');
      }

      return data;
    } catch (error) {
      console.error('获取分类失败:', error);
      throw error;
    }
  },

  /**
   * 获取分类的子分类
   */
  async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw new Error(`获取子分类失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('获取子分类失败:', error);
      throw error;
    }
  },

  /**
   * 获取AI分类建议
   */
  async getAICategorySuggestion(itemData: {
    name: string;
    description?: string;
    image_urls?: string[];
    userId?: string;
  }): Promise<{
    category_id: string;
    category_name: string;
    confidence: number;
    reasons: string[];
    alternatives: Array<{
      category_id: string;
      category_name: string;
      confidence: number;
    }>;
  }> {
    try {
      // 获取所有分类
      const categories = await this.getCategories();
      
      // 创建AI分类服务实例
      const aiService = createSimpleAICategoryService();
      aiService.setCategories(categories);
      
      // 调用AI分类服务
      const suggestion = await aiService.getCategorySuggestion({
        name: itemData.name,
        description: itemData.description,
        userId: itemData.userId || 'demo-user'
      });
      
      return suggestion;
    } catch (error) {
      console.error('AI分类建议失败:', error);
      
      // 失败时返回默认建议
      const categories = await this.getCategories();
      return {
        category_id: categories[0]?.id || 'other',
        category_name: categories[0]?.name || '其他',
        confidence: 0.3,
        reasons: ['基于通用分类规则'],
        alternatives: []
      };
    }
  },
};

/**
 * 图片上传服务
 */
export const uploadService = {
  /**
   * 上传图片
   */
  async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // 验证文件
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('请选择有效的图片文件');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        throw new Error('图片大小不能超过10MB');
      }

      // 清理文件名，移除特殊字符
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}_${sanitizedFileName}`;
      
      console.log('准备上传图片:', {
        originalName: file.name,
        sanitizedName: sanitizedFileName,
        finalName: fileName,
        size: file.size,
        type: file.type
      });
      
      const { error } = await supabase.storage
        .from('item-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('图片上传失败 - Supabase错误:', error);
        console.error('错误详情:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error
        });
        throw new Error(`图片上传失败: ${error.message}`);
      }

      // 获取公开URL
      const { data } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      if (!data || !data.publicUrl) {
        throw new Error('获取图片URL失败');
      }

      console.log('图片上传成功，公开URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('上传图片时出错:', error);
      throw error;
    }
  },

  /**
   * 批量上传图片
   */
  async uploadImages(files: File[], userId: string): Promise<string[]> {
    try {
      if (!files || files.length === 0) {
        return [];
      }

      if (files.length > 10) {
        throw new Error('一次最多只能上传10张图片');
      }

      console.log(`开始批量上传 ${files.length} 张图片`);
      const uploadPromises = files.map((file, index) => {
        console.log(`上传第 ${index + 1} 张图片:`, file.name);
        return this.uploadImage(file, userId);
      });
      
      const results = await Promise.all(uploadPromises);
      console.log('批量上传成功，URL列表:', results);
      return results;
    } catch (error) {
      console.error('批量上传图片失败:', error);
      throw error;
    }
  },

  /**
   * 删除图片
   */
  async deleteImage(imageUrl: string): Promise<void> {
    // 从URL中提取文件名
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // userId/filename

    const { error } = await supabase.storage
      .from('item-images')
      .remove([fileName]);

    if (error) throw error;
  },
};