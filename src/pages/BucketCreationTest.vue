<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">存储桶创建和测试</h1>
      
      <!-- 存储桶状态 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">1. 存储桶状态</h2>
        <div class="bg-gray-50 p-4 rounded mb-4">
          <p><strong>Supabase URL:</strong> <span class="text-sm">{{ supabaseUrl ? '已配置' : '未配置' }}</span></p>
          <p><strong>Supabase Key:</strong> <span class="text-sm">{{ supabaseKey ? '已配置' : '未配置' }}</span></p>
          <p><strong>存储桶名称:</strong> <span class="text-sm">{{ bucketName }}</span></p>
        </div>
        <button 
          @click="checkBucketStatus"
          :disabled="loading.check"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {{ loading.check ? '检查中...' : '检查存储桶状态' }}
        </button>
        
        <div v-if="bucketStatus" class="mt-4 p-4 rounded" :class="bucketStatus.exists ? 'bg-green-50' : 'bg-red-50'">
          <p :class="bucketStatus.exists ? 'text-green-800' : 'text-red-800'">
            {{ bucketStatus.exists ? '✅ 存储桶已存在' : '❌ 存储桶不存在' }}
          </p>
          <div v-if="bucketStatus.details" class="mt-2 text-sm">
            <p><strong>ID:</strong> {{ bucketStatus.details.id }}</p>
            <p><strong>名称:</strong> {{ bucketStatus.details.name }}</p>
            <p><strong>公开:</strong> {{ bucketStatus.details.public ? '是' : '否' }}</p>
          </div>
        </div>
      </div>

      <!-- 创建存储桶 -->
      <div v-if="bucketStatus && !bucketStatus.exists" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">2. 创建存储桶</h2>
        <button 
          @click="createBucket"
          :disabled="loading.create"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {{ loading.create ? '创建中...' : '创建存储桶' }}
        </button>
        
        <div v-if="createResult" class="mt-4 p-4 rounded" :class="createResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="createResult.success ? 'text-green-800' : 'text-red-800'">
            {{ createResult.message }}
          </p>
        </div>
      </div>

      <!-- 上传测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">3. 文件上传测试</h2>
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2 w-full"
        >
        <button 
          @click="testUpload"
          :disabled="!selectedFile || loading.upload"
          class="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 w-full"
        >
          {{ loading.upload ? '上传中...' : '测试上传' }}
        </button>
        
        <div v-if="uploadResult" class="mt-4 p-4 rounded" :class="uploadResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="uploadResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ uploadResult.success ? '✅ 上传成功' : '❌ 上传失败' }}
          </p>
          <div v-if="uploadResult.data" class="space-y-1">
            <p><strong>文件路径:</strong> {{ uploadResult.data.path }}</p>
            <p><strong>公开URL:</strong> 
              <a :href="uploadResult.publicUrl" target="_blank" class="text-blue-600 hover:underline text-sm break-all">
                {{ uploadResult.publicUrl }}
              </a>
            </p>
          </div>
          <div v-if="uploadResult.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(uploadResult.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 日志 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">测试日志</h2>
          <button 
            @click="clearLogs"
            class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
          >
            清除日志
          </button>
        </div>
        <div class="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'item-images';

const selectedFile = ref<File | null>(null);
const logs = ref<string[]>([]);

const loading = ref({
  check: false,
  create: false,
  upload: false
});

const bucketStatus = ref<any>(null);
const createResult = ref<any>(null);
const uploadResult = ref<any>(null);

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

function addLog(message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  if (data) {
    logs.value.push(`[${timestamp}] 数据: ${JSON.stringify(data, null, 2)}`);
  }
  console.log(message, data);
}

function clearLogs() {
  logs.value = [];
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    addLog('选择文件', {
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      type: selectedFile.value.type
    });
  }
}

async function checkBucketStatus() {
  loading.value.check = true;
  bucketStatus.value = null;
  
  try {
    addLog('开始检查存储桶状态...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      addLog('获取存储桶列表失败', error);
      bucketStatus.value = { exists: false, error: error.message };
      return;
    }
    
    addLog('存储桶列表获取成功', buckets);
    
    // 查找 item-images 存储桶
    const targetBucket = buckets.find(bucket => bucket.id === bucketName);
    
    if (targetBucket) {
      bucketStatus.value = {
        exists: true,
        details: {
          id: targetBucket.id,
          name: targetBucket.name,
          public: targetBucket.public,
          fileSizeLimit: targetBucket.fileSizeLimit,
          allowedMimeTypes: targetBucket.allowedMimeTypes
        }
      };
      addLog(`找到存储桶: ${bucketName}`);
    } else {
      bucketStatus.value = { exists: false };
      addLog(`存储桶 ${bucketName} 不存在`);
    }
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    bucketStatus.value = { exists: false, error: errorMessage };
    addLog('检查存储桶时出错', error);
  } finally {
    loading.value.check = false;
  }
}

async function createBucket() {
  loading.value.create = true;
  createResult.value = null;
  
  try {
    addLog('开始创建存储桶...');
    
    // 注意：Supabase 客户端通常不允许通过前端 API 创建存储桶
    // 我们需要使用 SQL 或者服务端 API
    addLog('正在通过迁移文件创建存储桶...');
    
    // 模拟创建过程
    // 在实际应用中，存储桶应该通过迁移文件创建
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error(`无法访问存储: ${error.message}`);
    }
    
    const exists = buckets.some(bucket => bucket.id === bucketName);
    
    if (exists) {
      createResult.value = {
        success: true,
        message: '✅ 存储桶已存在，无需创建'
      };
      addLog('存储桶已存在');
    } else {
      createResult.value = {
        success: false,
        message: '❌ 存储桶不存在，需要通过迁移文件创建'
      };
      addLog('存储桶不存在，需要创建');
    }
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    createResult.value = {
      success: false,
      message: `❌ 创建失败: ${errorMessage}`
    };
    addLog('创建存储桶失败', error);
  } finally {
    loading.value.create = false;
  }
}

async function testUpload() {
  if (!selectedFile.value) return;
  
  loading.value.upload = true;
  uploadResult.value = null;
  
  try {
    addLog('开始文件上传测试...');
    
    const file = selectedFile.value;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `test/${Date.now()}_${sanitizedFileName}`;
    
    addLog('上传文件信息', {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      finalPath: filePath,
      size: file.size,
      type: file.type
    });
    
    // 执行上传
    addLog('开始上传到 Supabase...');
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      addLog('上传失败', error);
      uploadResult.value = {
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
          name: error.name
        }
      };
      return;
    }
    
    addLog('上传成功', data);
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    addLog('公开URL获取成功', urlData);
    
    uploadResult.value = {
      success: true,
      data: data,
      publicUrl: urlData?.publicUrl
    };
    
    // 清理测试文件
    if (data) {
      addLog('清理测试文件...');
      await supabase.storage.from(bucketName).remove([filePath]);
      addLog('测试文件已清理');
    }
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    uploadResult.value = {
      success: false,
      error: {
        message: errorMessage,
        stack: (error as Error).stack
      }
    };
    addLog('上传测试时出错', error);
  } finally {
    loading.value.upload = false;
  }
}

// 页面加载时自动检查
setTimeout(() => {
  checkBucketStatus();
}, 1000);
</script>