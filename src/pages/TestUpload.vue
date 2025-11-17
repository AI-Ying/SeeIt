<template>
  <div class="test-upload">
    <h1>图片上传测试</h1>
    
    <div class="test-section">
      <h2>1. 直接文件上传测试</h2>
      <input type="file" accept="image/*" @change="handleDirectUpload" />
      <div v-if="directUploadResult" class="result">
        <p>上传结果: {{ directUploadResult }}</p>
      </div>
    </div>

    <div class="test-section">
      <h2>2. 存储桶连接测试</h2>
      <button @click="testBucketConnection">测试存储桶连接</button>
      <div v-if="bucketTestResult" class="result">
        <p>存储桶状态: {{ bucketTestResult }}</p>
      </div>
    </div>

    <div class="test-section">
      <h2>3. 权限测试</h2>
      <button @click="testPermissions">测试权限</button>
      <div v-if="permissionTestResult" class="result">
        <p>权限状态: {{ permissionTestResult }}</p>
      </div>
    </div>

    <div class="test-section">
      <h2>4. 文件信息测试</h2>
      <input type="file" accept="image/*" @change="testFileInfo" />
      <div v-if="fileInfoResult" class="result">
        <p>文件信息: {{ fileInfoResult }}</p>
      </div>
    </div>

    <div class="test-section">
      <h2>调试日志</h2>
      <div class="debug-log">
        <div v-for="(log, index) in debugLogs" :key="index" :class="log.type">
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/utils/supabase';
import { uploadService } from '@/composables/useSupabase';

const directUploadResult = ref('');
const bucketTestResult = ref('');
const permissionTestResult = ref('');
const fileInfoResult = ref('');
const debugLogs = ref<Array<{type: string, message: string}>>([]);

const addLog = (type: string, message: string) => {
  debugLogs.value.push({ type, message });
  console.log(`[${type.toUpperCase()}] ${message}`);
};

const handleDirectUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    addLog('warn', '没有选择文件');
    return;
  }

  const file = files[0];
  addLog('info', `选择文件: ${file.name}, 大小: ${file.size}, 类型: ${file.type}`);

  try {
    directUploadResult.value = '上传中...';
    addLog('info', '开始直接上传测试');
    
    // 使用uploadService上传
    const url = await uploadService.uploadImage(file, 'test-user');
    directUploadResult.value = `上传成功: ${url}`;
    addLog('success', `上传成功: ${url}`);
  } catch (error: any) {
    directUploadResult.value = `上传失败: ${error.message}`;
    addLog('error', `上传失败: ${error.message}`);
    console.error('上传错误详情:', error);
  }
};

const testBucketConnection = async () => {
  try {
    bucketTestResult.value = '测试中...';
    addLog('info', '开始存储桶连接测试');
    
    // 尝试获取存储桶信息
    const { data, error } = await supabase.storage.getBucket('item-images');
    
    if (error) {
      bucketTestResult.value = `存储桶连接失败: ${error.message}`;
      addLog('error', `存储桶连接失败: ${error.message}`);
    } else {
      bucketTestResult.value = `存储桶连接成功: ${JSON.stringify(data)}`;
      addLog('success', `存储桶连接成功`);
    }
  } catch (error: any) {
    bucketTestResult.value = `存储桶测试失败: ${error.message}`;
    addLog('error', `存储桶测试失败: ${error.message}`);
  }
};

const testPermissions = async () => {
  try {
    permissionTestResult.value = '测试中...';
    addLog('info', '开始权限测试');
    
    // 尝试列出存储桶中的文件
    const { data, error } = await supabase.storage
      .from('item-images')
      .list('', { limit: 1 });
    
    if (error) {
      permissionTestResult.value = `权限测试失败: ${error.message}`;
      addLog('error', `权限测试失败: ${error.message}`);
    } else {
      permissionTestResult.value = `权限测试成功，找到 ${data?.length || 0} 个文件`;
      addLog('success', `权限测试成功`);
    }
  } catch (error: any) {
    permissionTestResult.value = `权限测试失败: ${error.message}`;
    addLog('error', `权限测试失败: ${error.message}`);
  }
};

const testFileInfo = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    addLog('warn', '没有选择文件');
    return;
  }

  const file = files[0];
  const info = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
    isImage: file.type.startsWith('image/'),
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
  };
  
  fileInfoResult.value = JSON.stringify(info, null, 2);
  addLog('info', `文件信息: ${JSON.stringify(info)}`);
};
</script>

<style scoped>
.test-upload {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.test-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
}

.result {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
}

.debug-log {
  max-height: 300px;
  overflow-y: auto;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}

.debug-log .info {
  color: #0066cc;
}

.debug-log .success {
  color: #00aa00;
}

.debug-log .warn {
  color: #ff9900;
}

.debug-log .error {
  color: #cc0000;
}

button {
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #f0f0f0;
}

input[type="file"] {
  margin: 0.5rem 0;
}
</style>