<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">直接上传测试</h1>
      
      <!-- 环境变量检查 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">环境变量检查</h2>
        <div class="bg-gray-50 p-4 rounded">
          <p><strong>Supabase URL:</strong> {{ supabaseUrl ? '已配置' : '未配置' }}</p>
          <p><strong>Supabase Key:</strong> {{ supabaseKey ? '已配置' : '未配置' }}</p>
          <p><strong>存储桶名称:</strong> {{ bucketName }}</p>
        </div>
      </div>

      <!-- 快速上传测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">快速上传测试</h2>
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2 w-full"
        >
        <button 
          @click="quickUploadTest"
          :disabled="!selectedFile || loading"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 w-full"
        >
          {{ loading ? '上传中...' : '快速上传测试' }}
        </button>
      </div>

      <!-- 结果展示 -->
      <div v-if="result" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">测试结果</h2>
        <div :class="result.success ? 'bg-green-50' : 'bg-red-50'" class="p-4 rounded">
          <p class="font-semibold" :class="result.success ? 'text-green-800' : 'text-red-800'">
            {{ result.success ? '✅ 上传成功' : '❌ 上传失败' }}
          </p>
          <div v-if="result.data" class="mt-2">
            <p><strong>文件路径:</strong> {{ result.data.path }}</p>
            <p><strong>公开URL:</strong> 
              <a :href="result.publicUrl" target="_blank" class="text-blue-600 hover:underline">
                {{ result.publicUrl }}
              </a>
            </p>
          </div>
          <div v-if="result.error" class="mt-2">
            <p><strong>错误信息:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1">{{ JSON.stringify(result.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 详细日志 -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-semibold mb-4">详细日志</h2>
        <div class="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            {{ log }}
          </div>
        </div>
        <button 
          @click="logs = []"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
        >
          清除日志
        </button>
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
const loading = ref(false);
const result = ref<any>(null);
const logs = ref<string[]>([]);

function addLog(message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
  if (data) {
    logs.value.push(`[${timestamp}] 数据: ${JSON.stringify(data, null, 2)}`);
  }
  console.log(message, data);
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

async function quickUploadTest() {
  if (!selectedFile.value) return;
  
  loading.value = true;
  result.value = null;
  
  try {
    addLog('开始快速上传测试...');
    
    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey);
    addLog('Supabase 客户端创建成功');
    
    const file = selectedFile.value;
    const fileName = `direct-test/${Date.now()}_${file.name}`;
    
    addLog('上传文件信息', {
      name: file.name,
      size: file.size,
      type: file.type,
      targetPath: fileName
    });
    
    // 直接上传文件
    addLog('开始上传文件...');
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      addLog('上传失败', error);
      result.value = {
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
      .getPublicUrl(fileName);
    
    addLog('公开URL获取成功', urlData);
    
    result.value = {
      success: true,
      data: data,
      publicUrl: urlData?.publicUrl
    };
    
    addLog('快速上传测试完成');
    
  } catch (error) {
    addLog('上传测试时出错', error);
    result.value = {
      success: false,
      error: {
        message: (error as Error).message,
        stack: (error as Error).stack
      }
    };
  } finally {
    loading.value = false;
  }
}
</script>