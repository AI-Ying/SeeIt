<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">存储桶诊断测试</h1>
      
      <!-- 存储桶状态检查 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">1. 存储桶状态检查</h2>
        <button 
          @click="checkBucketStatus"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          检查存储桶状态
        </button>
        <div v-if="bucketStatus" class="bg-gray-50 p-4 rounded">
          <pre class="text-sm">{{ JSON.stringify(bucketStatus, null, 2) }}</pre>
        </div>
      </div>

      <!-- 权限测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">2. 权限测试</h2>
        <button 
          @click="testPermissions"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
        >
          测试存储权限
        </button>
        <div v-if="permissionResults" class="bg-gray-50 p-4 rounded">
          <pre class="text-sm">{{ JSON.stringify(permissionResults, null, 2) }}</pre>
        </div>
      </div>

      <!-- 文件上传测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">3. 文件上传测试</h2>
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2"
        >
        <button 
          @click="testUpload"
          :disabled="!selectedFile"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 mb-4"
        >
          测试上传
        </button>
        <div v-if="uploadResult" class="bg-gray-50 p-4 rounded">
          <pre class="text-sm">{{ JSON.stringify(uploadResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 日志输出 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">4. 详细日志</h2>
        <div class="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            {{ log }}
          </div>
        </div>
        <button 
          @click="clearLogs"
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
import { supabase } from '@/utils/supabase';

const logs = ref<string[]>([]);
const bucketStatus = ref<any>(null);
const permissionResults = ref<any>(null);
const selectedFile = ref<File | null>(null);
const uploadResult = ref<any>(null);

function addLog(message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  logs.value.push(logMessage);
  if (data) {
    logs.value.push(`[${timestamp}] 数据: ${JSON.stringify(data, null, 2)}`);
  }
  console.log(logMessage, data);
}

async function checkBucketStatus() {
  try {
    addLog('开始检查存储桶状态...');
    
    // 检查存储桶是否存在
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      addLog('获取存储桶列表失败', bucketError);
      bucketStatus.value = { error: bucketError.message };
      return;
    }
    
    addLog('存储桶列表获取成功', buckets);
    
    // 查找 item-images 存储桶
    const itemImagesBucket = buckets.find(b => b.id === 'item-images');
    
    if (!itemImagesBucket) {
      addLog('item-images 存储桶不存在');
      bucketStatus.value = { 
        error: 'item-images 存储桶不存在',
        availableBuckets: buckets.map(b => ({ id: b.id, name: b.name, public: b.public }))
      };
      return;
    }
    
    addLog('item-images 存储桶信息', itemImagesBucket);
    
    bucketStatus.value = {
      bucket: {
        id: itemImagesBucket.id,
        name: itemImagesBucket.name,
        public: itemImagesBucket.public,
        fileSizeLimit: itemImagesBucket.fileSizeLimit,
        allowedMimeTypes: itemImagesBucket.allowedMimeTypes,
        createdAt: itemImagesBucket.createdAt
      },
      allBuckets: buckets.map(b => ({ id: b.id, name: b.name }))
    };
    
    addLog('存储桶状态检查完成');
  } catch (error) {
    addLog('检查存储桶状态时出错', error);
    bucketStatus.value = { error: (error as Error).message };
  }
}

async function testPermissions() {
  try {
    addLog('开始测试存储权限...');
    
    const testFileName = 'test-permission.txt';
    const testContent = new Blob(['permission test'], { type: 'text/plain' });
    
    // 测试上传权限
    addLog('测试上传权限...');
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      addLog('上传权限测试失败', uploadError);
    } else {
      addLog('上传权限测试成功');
    }
    
    // 测试读取权限
    addLog('测试读取权限...');
    const { data: readData, error: readError } = await supabase.storage
      .from('item-images')
      .list('', { limit: 1 });
    
    if (readError) {
      addLog('读取权限测试失败', readError);
    } else {
      addLog('读取权限测试成功', readData);
    }
    
    // 测试删除权限
    if (!uploadError) {
      addLog('测试删除权限...');
      const { error: deleteError } = await supabase.storage
        .from('item-images')
        .remove([testFileName]);
      
      if (deleteError) {
        addLog('删除权限测试失败', deleteError);
      } else {
        addLog('删除权限测试成功');
      }
    }
    
    permissionResults.value = {
      upload: uploadError ? { error: uploadError.message } : { success: true },
      read: readError ? { error: readError.message } : { success: true, data: readData },
      delete: !uploadError ? { success: true } : { error: '跳過刪除測試' }
    };
    
    addLog('权限测试完成');
  } catch (error) {
    addLog('权限测试时出错', error);
    permissionResults.value = { error: (error as Error).message };
  }
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

async function testUpload() {
  if (!selectedFile.value) return;
  
  try {
    addLog('开始上传测试...');
    
    const file = selectedFile.value;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `test/${Date.now()}_${sanitizedFileName}`;
    
    addLog('上传文件信息', {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      finalName: fileName,
      size: file.size,
      type: file.type
    });
    
    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      addLog('上传失败', error);
      uploadResult.value = { error: error.message, details: error };
      return;
    }
    
    addLog('上传成功', data);
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);
    
    addLog('公开URL', urlData);
    
    uploadResult.value = {
      success: true,
      data: data,
      publicUrl: urlData?.publicUrl
    };
    
    // 清理测试文件
    if (data) {
      addLog('清理测试文件...');
      await supabase.storage
        .from('item-images')
        .remove([fileName]);
      addLog('测试文件已清理');
    }
    
  } catch (error) {
    addLog('上传测试时出错', error);
    uploadResult.value = { error: (error as Error).message };
  }
}

function clearLogs() {
  logs.value = [];
}
</script>