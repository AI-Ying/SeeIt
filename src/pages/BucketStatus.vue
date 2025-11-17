<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">存储桶状态检查</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">存储桶列表</h2>
        <button 
          @click="checkBuckets"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          检查存储桶
        </button>
        
        <div v-if="buckets.length > 0" class="space-y-4">
          <div v-for="bucket in buckets" :key="bucket.id" class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-lg">{{ bucket.name }}</h3>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>ID:</strong> {{ bucket.id }}</p>
              <p><strong>公开:</strong> {{ bucket.public ? '是' : '否' }}</p>
              <p><strong>文件大小限制:</strong> {{ formatFileSize(bucket.file_size_limit) }}</p>
              <p><strong>允许的MIME类型:</strong> {{ bucket.allowed_mime_types?.join(', ') || '无限制' }}</p>
              <p><strong>创建时间:</strong> {{ formatDate(bucket.created_at) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {{ error }}
        </div>
      </div>

      <!-- 权限检查 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">权限测试</h2>
        <button 
          @click="testPermissions"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
        >
          测试权限
        </button>
        
        <div v-if="permissionResults" class="bg-gray-50 p-4 rounded">
          <pre class="text-sm">{{ JSON.stringify(permissionResults, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/utils/supabase';

interface Bucket {
  id: string;
  name: string;
  public: boolean;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  created_at: string;
}

const buckets = ref<Bucket[]>([]);
const error = ref<string>('');
const permissionResults = ref<any>(null);

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '无限制';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}

async function checkBuckets() {
  try {
    error.value = '';
    
    console.log('开始检查存储桶...');
    const { data, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('获取存储桶列表失败:', listError);
      error.value = `获取存储桶列表失败: ${listError.message}`;
      return;
    }
    
    console.log('存储桶列表:', data);
    buckets.value = data || [];
    
    // 检查是否有 item-images 存储桶
    const hasItemImages = buckets.value.some(bucket => bucket.id === 'item-images');
    console.log('item-images 存储桶存在:', hasItemImages);
    
    if (!hasItemImages) {
      error.value = '警告：item-images 存储桶不存在，请检查迁移文件是否执行成功';
    }
    
  } catch (err) {
    console.error('检查存储桶时出错:', err);
    error.value = `检查存储桶时出错: ${(err as Error).message}`;
  }
}

async function testPermissions() {
  try {
    console.log('开始测试权限...');
    
    // 测试上传权限
    const testFileName = 'permission-test.txt';
    const testContent = new Blob(['permission test'], { type: 'text/plain' });
    
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      permissionResults.value = {
        upload: { success: false, error: uploadError.message },
        message: '上传权限测试失败'
      };
      return;
    }
    
    // 如果上传成功，清理测试文件
    await supabase.storage.from('item-images').remove([testFileName]);
    
    permissionResults.value = {
      upload: { success: true },
      message: '权限测试通过 - 可以上传、删除文件'
    };
    
  } catch (err) {
    permissionResults.value = {
      error: `权限测试失败: ${(err as Error).message}`
    };
  }
}

// 页面加载时自动检查
setTimeout(() => {
  checkBuckets();
}, 1000);
</script>