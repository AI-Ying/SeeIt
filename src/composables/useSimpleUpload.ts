import { createClient } from '@supabase/supabase-js';

// 基础 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 创建最基础的 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // 禁用会话持久化
    autoRefreshToken: false, // 禁用自动刷新
  }
});

/**
 * 简化版上传服务 - 用于测试和调试
 */
export const simpleUploadService = {
  /**
   * 上传单个文件 - 最简版本
   */
  async uploadFile(file: File, userId: string): Promise<string> {
    try {
      console.log('=== 简化上传开始 ===');
      console.log('文件信息:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      console.log('用户ID:', userId);

      // 验证文件
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('请选择有效的图片文件');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片大小不能超过10MB');
      }

      // 生成文件名
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${timestamp}_${safeFileName}`;
      
      console.log('生成的文件路径:', filePath);

      // 执行上传
      console.log('开始上传到 Supabase...');
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('上传失败:', error);
        throw new Error(`上传失败: ${error.message}`);
      }

      console.log('上传成功，数据:', data);

      // 获取公开URL
      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      console.log('公开URL数据:', urlData);

      if (!urlData?.publicUrl) {
        throw new Error('获取公开URL失败');
      }

      console.log('=== 简化上传完成 ===');
      return urlData.publicUrl;

    } catch (error) {
      console.error('简化上传服务出错:', error);
      throw error;
    }
  },

  /**
   * 测试存储桶连接
   */
  async testBucketConnection(): Promise<boolean> {
    try {
      console.log('测试存储桶连接...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('获取存储桶列表失败:', error);
        return false;
      }
      
      console.log('可用存储桶:', buckets);
      
      const hasItemImages = buckets.some(bucket => bucket.id === 'item-images');
      console.log('item-images 存储桶存在:', hasItemImages);
      
      return hasItemImages;
    } catch (error) {
      console.error('测试存储桶连接失败:', error);
      return false;
    }
  },

  /**
   * 测试简单上传
   */
  async testSimpleUpload(): Promise<{ success: boolean; error?: any; data?: any }> {
    try {
      console.log('开始简单上传测试...');
      
      // 创建一个简单的测试文件
      const testContent = new Blob(['test content'], { type: 'text/plain' });
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      const result = await this.uploadFile(testFile, 'test-user');
      
      console.log('简单上传测试成功:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('简单上传测试失败:', error);
      return { success: false, error };
    }
  }
};

export default simpleUploadService;