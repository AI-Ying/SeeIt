<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">上传功能验证测试</h1>
      
      <!-- 基础信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">系统信息</h2>
        <div class="bg-gray-50 p-4 rounded space-y-2">
          <p><strong>Supabase URL:</strong> <span class="text-sm">{{ supabaseUrl ? '已配置' : '未配置' }}</span></p>
          <p><strong>Supabase Key:</strong> <span class="text-sm">{{ supabaseKey ? '已配置' : '未配置' }}</span></p>
          <p><strong>存储桶:</strong> <span class="text-sm">{{ bucketName }}</span></p>
          <p><strong>用户ID:</strong> <span class="text-sm">{{ userId }}</span></p>
        </div>
      </div>

      <!-- 连接测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">连接测试</h2>
        <button 
          @click="testConnection"
          :disabled="loading.connection"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {{ loading.connection ? '测试中...' : '测试连接' }}
        </button>
        <div v-if="results.connection" class="mt-4 p-4 rounded" :class="results.connection.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="results.connection.success ? 'text-green-800' : 'text-red-800'">
            {{ results.connection.message }}
          </p>
        </div>
      </div>

      <!-- 文件上传测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">文件上传测试</h2>
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2 w-full"
        >
        <button 
          @click="testUpload"
          :disabled="!selectedFile || loading.upload"
          class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 w-full"
        >
          {{ loading.upload ? '上传中...' : '测试上传' }}
        </button>
        
        <div v-if="results.upload" class="mt-4 p-4 rounded" :class="results.upload.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="results.upload.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ results.upload.success ? '✅ 上传成功' : '❌ 上传失败' }}
          </p>
          <div v-if="results.upload.data" class="space-y-1">
            <p><strong>文件路径:</strong> {{ results.upload.data.path }}</p>
            <p><strong>公开URL:</strong> 
              <a :href="results.upload.publicUrl" target="_blank" class="text-blue-600 hover:underline text-sm">
                {{ results.upload.publicUrl }}
              </a>
            </p>
          </div>
          <div v-if="results.upload.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(results.upload.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 完整流程测试 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">完整流程测试</h2>
        <button 
          @click="testFullProcess"
          :disabled="loading.fullProcess"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 w-full"
        >
          {{ loading.fullProcess ? '测试中...' : '测试完整流程' }}
        </button>
        <div v-if="results.fullProcess" class="mt-4 p-4 rounded" :class="results.fullProcess.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="results.fullProcess.success ? 'text-green-800' : 'text-red-800'">
            {{ results.fullProcess.message }}
          </p>
        </div>
      </div>

      <!-- 日志 -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
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
import { simpleUploadService } from '@/composables/useSimpleUpload';
import { useAuth } from '@/composables/useAuth';

const { userId } = useAuth();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucketName = 'item-images';

const selectedFile = ref<File | null>(null);
const logs = ref<string[]>([]);

const loading = ref({
  connection: false,
  upload: false,
  fullProcess: false
});

const results = ref({
  connection: null as any,
  upload: null as any,
  fullProcess: null as any
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

async function testConnection() {
  loading.value.connection = true;
  results.value.connection = null;
  
  try {
    addLog('开始连接测试...');
    const hasBucket = await simpleUploadService.testBucketConnection();
    
    if (hasBucket) {
      results.value.connection = {
        success: true,
        message: '✅ 存储桶连接成功，item-images 存储桶存在'
      };
      addLog('连接测试通过');
    } else {
      results.value.connection = {
        success: false,
        message: '❌ 存储桶连接失败，item-images 存储桶不存在'
      };
      addLog('连接测试失败：存储桶不存在');
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    results.value.connection = {
      success: false,
      message: `❌ 连接测试失败: ${errorMessage}`
    };
    addLog('连接测试失败', error);
  } finally {
    loading.value.connection = false;
  }
}

async function testUpload() {
  if (!selectedFile.value) return;
  
  loading.value.upload = true;
  results.value.upload = null;
  
  try {
    addLog('开始文件上传测试...');
    
    const publicUrl = await simpleUploadService.uploadFile(selectedFile.value, userId.value);
    
    results.value.upload = {
      success: true,
      publicUrl: publicUrl,
      data: { path: publicUrl.split('/').pop() }
    };
    
    addLog('文件上传测试成功', { publicUrl });
  } catch (error) {
    const errorMessage = (error as Error).message;
    results.value.upload = {
      success: false,
      error: {
        message: errorMessage,
        name: (error as Error).name
      }
    };
    addLog('文件上传测试失败', error);
  } finally {
    loading.value.upload = false;
  }
}

async function testFullProcess() {
  loading.value.fullProcess = true;
  results.value.fullProcess = null;
  
  try {
    addLog('开始完整流程测试...');
    
    // 1. 测试连接
    addLog('步骤1: 测试存储桶连接...');
    const hasBucket = await simpleUploadService.testBucketConnection();
    if (!hasBucket) {
      throw new Error('存储桶连接失败');
    }
    addLog('✅ 存储桶连接成功');
    
    // 2. 测试简单上传
    addLog('步骤2: 测试简单上传...');
    const simpleTest = await simpleUploadService.testSimpleUpload();
    if (!simpleTest.success) {
      throw new Error('简单上传测试失败: ' + simpleTest.error);
    }
    addLog('✅ 简单上传测试成功');
    
    results.value.fullProcess = {
      success: true,
      message: '✅ 完整流程测试通过：连接测试和上传测试都成功'
    };
    
    addLog('完整流程测试完成');
  } catch (error) {
    const errorMessage = (error as Error).message;
    results.value.fullProcess = {
      success: false,
      message: `❌ 完整流程测试失败: ${errorMessage}`
    };
    addLog('完整流程测试失败', error);
  } finally {
    loading.value.fullProcess = false;
  }
}
</script>