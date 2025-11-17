<template>
  <div class="simple-upload-test">
    <h1>简单上传测试</h1>
    
    <div class="test-area">
      <h3>测试1: 基础文件信息</h3>
      <input type="file" accept="image/*" @change="testBasicFileInfo" />
      <div v-if="basicFileInfo" class="result">
        <pre>{{ basicFileInfo }}</pre>
      </div>
    </div>

    <div class="test-area">
      <h3>测试2: Supabase存储连接</h3>
      <button @click="testSupabaseConnection">测试连接</button>
      <div v-if="connectionResult" class="result">
        {{ connectionResult }}
      </div>
    </div>

    <div class="test-area">
      <h3>测试3: 简单上传测试</h3>
      <input type="file" accept="image/*" @change="simpleUploadTest" />
      <div v-if="uploadResult" class="result" :class="{ error: uploadResult.includes('失败'), success: uploadResult.includes('成功') }">
        {{ uploadResult }}
      </div>
    </div>

    <div class="test-area">
      <h3>调试日志</h3>
      <div class="log-area">
        <div v-for="(log, index) in logs" :key="index" :class="log.type">
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/utils/supabase';

const basicFileInfo = ref('');
const connectionResult = ref('');
const uploadResult = ref('');
const logs = ref<Array<{type: string, message: string}>>([]);

const addLog = (type: string, message: string) => {
  logs.value.push({ type, message });
  console.log(`[${type}] ${message}`);
};

const testBasicFileInfo = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    basicFileInfo.value = '没有选择文件';
    return;
  }

  const file = files[0];
  const info = {
    name: file.name,
    size: file.size,
    type: file.type,
    isImage: file.type.startsWith('image/'),
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
  };
  
  basicFileInfo.value = JSON.stringify(info, null, 2);
  addLog('info', `文件选择: ${file.name}, ${info.sizeInMB}MB, ${file.type}`);
};

const testSupabaseConnection = async () => {
  try {
    connectionResult.value = '连接中...';
    addLog('info', '开始测试Supabase连接');
    
    // 测试1: 检查是否能访问存储
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      connectionResult.value = `存储连接失败: ${bucketError.message}`;
      addLog('error', `存储连接失败: ${bucketError.message}`);
      return;
    }
    
    addLog('success', `找到 ${buckets?.length || 0} 个存储桶`);
    
    // 测试2: 检查item-images存储桶
    const { data: bucketInfo, error: infoError } = await supabase.storage.getBucket('item-images');
    
    if (infoError) {
      connectionResult.value = `item-images存储桶不存在: ${infoError.message}`;
      addLog('error', `item-images存储桶不存在: ${infoError.message}`);
      return;
    }
    
    connectionResult.value = `连接成功! 存储桶: ${JSON.stringify(bucketInfo, null, 2)}`;
    addLog('success', 'Supabase连接测试通过');
    
  } catch (error: any) {
    connectionResult.value = `连接失败: ${error.message}`;
    addLog('error', `连接失败: ${error.message}`);
  }
};

const simpleUploadTest = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) {
    uploadResult.value = '没有选择文件';
    return;
  }

  const file = files[0];
  
  if (!file.type.startsWith('image/')) {
    uploadResult.value = '请选择图片文件';
    return;
  }

  try {
    uploadResult.value = '上传中...';
    addLog('info', `开始上传文件: ${file.name}`);
    
    // 创建简单的文件名
    const fileName = `test/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    addLog('info', `上传文件名: ${fileName}`);
    
    // 直接上传到Supabase
    const { error } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      uploadResult.value = `上传失败: ${error.message}`;
      addLog('error', `上传失败: ${error.message}`);
      console.error('上传错误详情:', error);
    } else {
      // 获取公开URL
      const { data } = supabase.storage.from('item-images').getPublicUrl(fileName);
      uploadResult.value = `上传成功! URL: ${data.publicUrl}`;
      addLog('success', `上传成功: ${data.publicUrl}`);
    }
    
  } catch (error: any) {
    uploadResult.value = `上传异常: ${error.message}`;
    addLog('error', `上传异常: ${error.message}`);
    console.error('上传异常:', error);
  }
};
</script>

<style scoped>
.simple-upload-test {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.test-area {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
}

.result.success {
  background: #e8f5e8;
  color: #2d7d2d;
}

.result.error {
  background: #ffeaea;
  color: #d42c2c;
}

.log-area {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}

.log-area .info {
  color: #0066cc;
}

.log-area .success {
  color: #00aa00;
}

.log-area .error {
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