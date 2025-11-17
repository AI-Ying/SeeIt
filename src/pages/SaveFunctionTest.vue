<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">保存功能详细诊断</h1>
      
      <!-- 环境检查 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">环境检查</h2>
        <div class="bg-gray-50 p-4 rounded space-y-2">
          <p><strong>Supabase URL:</strong> <span class="text-sm">{{ supabaseUrl ? '已配置' : '未配置' }}</span></p>
          <p><strong>Supabase Key:</strong> <span class="text-sm">{{ supabaseKey ? '已配置' : '未配置' }}</span></p>
          <p><strong>用户ID:</strong> <span class="text-sm">{{ userId }}</span></p>
        </div>
      </div>

      <!-- 数据库连接测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">1. 数据库连接测试</h2>
        <button 
          @click="testDatabaseConnection"
          :disabled="loading.database"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 mb-4"
        >
          {{ loading.database ? '测试中...' : '测试数据库连接' }}
        </button>
        <div v-if="databaseResult" class="p-4 rounded" :class="databaseResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="databaseResult.success ? 'text-green-800' : 'text-red-800'">
            {{ databaseResult.message }}
          </p>
          <div v-if="databaseResult.details" class="mt-2 text-sm">
            <pre class="bg-gray-100 p-2 rounded">{{ JSON.stringify(databaseResult.details, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 物品创建测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">2. 物品创建测试</h2>
        <div class="mb-4 p-4 bg-gray-50 rounded">
          <h3 class="font-medium mb-2">测试数据</h3>
          <pre class="text-sm">{{ JSON.stringify(testItemData, null, 2) }}</pre>
        </div>
        <button 
          @click="testItemCreation"
          :disabled="loading.itemCreation"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 mb-4"
        >
          {{ loading.itemCreation ? '创建中...' : '测试物品创建' }}
        </button>
        <div v-if="itemCreationResult" class="p-4 rounded" :class="itemCreationResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="itemCreationResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ itemCreationResult.success ? '✅ 创建成功' : '❌ 创建失败' }}
          </p>
          <div v-if="itemCreationResult.data" class="space-y-1">
            <p><strong>物品ID:</strong> {{ itemCreationResult.data.id }}</p>
            <p><strong>名称:</strong> {{ itemCreationResult.data.name }}</p>
          </div>
          <div v-if="itemCreationResult.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(itemCreationResult.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 图片上传测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">3. 图片上传测试</h2>
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2 w-full"
        >
        <button 
          @click="testImageUpload"
          :disabled="!selectedFile || loading.imageUpload"
          class="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 w-full"
        >
          {{ loading.imageUpload ? '上传中...' : '测试图片上传' }}
        </button>
        <div v-if="imageUploadResult" class="mt-4 p-4 rounded" :class="imageUploadResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="imageUploadResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ imageUploadResult.success ? '✅ 上传成功' : '❌ 上传失败' }}
          </p>
          <div v-if="imageUploadResult.data" class="space-y-1">
            <p><strong>文件路径:</strong> {{ imageUploadResult.data.path }}</p>
            <p><strong>公开URL:</strong> 
              <a :href="imageUploadResult.publicUrl" target="_blank" class="text-blue-600 hover:underline text-sm break-all">
                {{ imageUploadResult.publicUrl }}
              </a>
            </p>
          </div>
          <div v-if="imageUploadResult.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(imageUploadResult.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 完整流程测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">4. 完整流程测试（带图片）</h2>
        <input 
          type="file" 
          @change="handleFullTestFileSelect" 
          accept="image/*"
          class="mb-4 border border-gray-300 rounded p-2 w-full"
        >
        <button 
          @click="testFullProcess"
          :disabled="!fullTestFile || loading.fullProcess"
          class="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:bg-gray-300 w-full"
        >
          {{ loading.fullProcess ? '测试中...' : '测试完整流程' }}
        </button>
        <div v-if="fullProcessResult" class="mt-4 p-4 rounded" :class="fullProcessResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="fullProcessResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ fullProcessResult.success ? '✅ 完整流程成功' : '❌ 完整流程失败' }}
          </p>
          <div v-if="fullProcessResult.data" class="space-y-1">
            <p><strong>物品ID:</strong> {{ fullProcessResult.data.id }}</p>
            <p><strong>名称:</strong> {{ fullProcessResult.data.name }}</p>
            <p><strong>图片URLs:</strong></p>
            <ul class="list-disc list-inside ml-4">
              <li v-for="(url, index) in fullProcessResult.data.image_urls" :key="index">
                <a :href="url" target="_blank" class="text-blue-600 hover:underline text-sm">{{ url }}</a>
              </li>
            </ul>
          </div>
          <div v-if="fullProcessResult.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(fullProcessResult.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 日志 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">详细日志</h2>
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
import { supabase } from '@/utils/supabase';
import { itemService, uploadService } from '@/composables/useSupabase';
import { simpleUploadService } from '@/composables/useSimpleUpload';
import { useAuth } from '@/composables/useAuth';

const { userId } = useAuth();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 测试数据
const testItemData = {
  user_id: userId.value,
  name: '测试物品',
  description: '这是一个测试物品',
  brand: '测试品牌',
  model: '测试型号',
  condition: 'good',
  category_id: 'other',
  subcategory_id: '',
  purchase_date: '2024-01-01',
  purchase_price: 99.99,
  purchase_location: '测试地点',
  quantity: 1,
  tags: ['测试', '演示'],
  notes: '这是测试笔记'
};

const selectedFile = ref<File | null>(null);
const fullTestFile = ref<File | null>(null);
const logs = ref<string[]>([]);

const loading = ref({
  database: false,
  itemCreation: false,
  imageUpload: false,
  fullProcess: false
});

const databaseResult = ref<any>(null);
const itemCreationResult = ref<any>(null);
const imageUploadResult = ref<any>(null);
const fullProcessResult = ref<any>(null);

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
    addLog('选择测试文件', {
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      type: selectedFile.value.type
    });
  }
}

function handleFullTestFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    fullTestFile.value = target.files[0];
    addLog('选择完整测试文件', {
      name: fullTestFile.value.name,
      size: fullTestFile.value.size,
      type: fullTestFile.value.type
    });
  }
}

async function testDatabaseConnection() {
  loading.value.database = true;
  databaseResult.value = null;
  
  try {
    addLog('开始测试数据库连接...');
    
    // 测试基本连接
    const { data, error } = await supabase.from('items').select('id').limit(1);
    
    if (error) {
      addLog('数据库连接失败', error);
      databaseResult.value = {
        success: false,
        message: `❌ 数据库连接失败: ${error.message}`,
        details: error
      };
      return;
    }
    
    addLog('数据库连接成功', data);
    
    // 测试权限
    const { data: permissionData, error: permissionError } = await supabase
      .from('items')
      .select('count');
    
    if (permissionError) {
      addLog('权限测试失败', permissionError);
      databaseResult.value = {
        success: false,
        message: `❌ 权限测试失败: ${permissionError.message}`,
        details: permissionError
      };
      return;
    }
    
    addLog('权限测试成功', permissionData);
    
    databaseResult.value = {
      success: true,
      message: '✅ 数据库连接和权限测试通过',
      details: { connection: data, permission: permissionData }
    };
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    databaseResult.value = {
      success: false,
      message: `❌ 数据库测试失败: ${errorMessage}`,
      details: error
    };
    addLog('数据库测试时出错', error);
  } finally {
    loading.value.database = false;
  }
}

async function testItemCreation() {
  loading.value.itemCreation = true;
  itemCreationResult.value = null;
  
  try {
    addLog('开始测试物品创建...');
    addLog('测试数据', testItemData);
    
    const createdItem = await itemService.createItem(testItemData);
    
    addLog('物品创建成功', createdItem);
    
    itemCreationResult.value = {
      success: true,
      data: createdItem,
      message: '✅ 物品创建成功'
    };
    
    // 清理测试数据
    if (createdItem.id) {
      addLog('清理测试物品...');
      await supabase.from('items').delete().eq('id', createdItem.id);
      addLog('测试物品已清理');
    }
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    itemCreationResult.value = {
      success: false,
      error: error,
      message: `❌ 物品创建失败: ${errorMessage}`
    };
    addLog('物品创建失败', error);
  } finally {
    loading.value.itemCreation = false;
  }
}

async function testImageUpload() {
  if (!selectedFile.value) return;
  
  loading.value.imageUpload = true;
  imageUploadResult.value = null;
  
  try {
    addLog('开始测试图片上传...');
    
    const publicUrl = await simpleUploadService.uploadFile(selectedFile.value, userId.value);
    
    addLog('图片上传成功', { publicUrl });
    
    imageUploadResult.value = {
      success: true,
      data: { path: publicUrl.split('/').pop() },
      publicUrl: publicUrl,
      message: '✅ 图片上传成功'
    };
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    imageUploadResult.value = {
      success: false,
      error: error,
      message: `❌ 图片上传失败: ${errorMessage}`
    };
    addLog('图片上传失败', error);
  } finally {
    loading.value.imageUpload = false;
  }
}

async function testFullProcess() {
  if (!fullTestFile.value) return;
  
  loading.value.fullProcess = true;
  fullProcessResult.value = null;
  
  try {
    addLog('开始完整流程测试...');
    
    // 1. 上传图片
    addLog('步骤1: 上传图片...');
    const publicUrl = await simpleUploadService.uploadFile(fullTestFile.value, userId.value);
    addLog('图片上传成功', { publicUrl });
    
    // 2. 创建物品（包含图片URL）
    addLog('步骤2: 创建物品...');
    const fullTestData = {
      ...testItemData,
      name: '完整测试物品',
      image_urls: [publicUrl]
    };
    
    const createdItem = await itemService.createItem(fullTestData);
    addLog('物品创建成功', createdItem);
    
    fullProcessResult.value = {
      success: true,
      data: createdItem,
      message: '✅ 完整流程测试成功'
    };
    
    // 3. 清理测试数据
    addLog('步骤3: 清理测试数据...');
    if (createdItem.id) {
      await supabase.from('items').delete().eq('id', createdItem.id);
      addLog('测试物品已清理');
    }
    
    // 提取文件路径用于删除
    const filePath = publicUrl.split('/').slice(-2).join('/');
    addLog('清理测试图片...', { filePath });
    await supabase.storage.from('item-images').remove([filePath]);
    addLog('测试图片已清理');
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    fullProcessResult.value = {
      success: false,
      error: error,
      message: `❌ 完整流程失败: ${errorMessage}`
    };
    addLog('完整流程测试失败', error);
  } finally {
    loading.value.fullProcess = false;
  }
}

// 页面加载时自动测试数据库连接
setTimeout(() => {
  testDatabaseConnection();
}, 1000);
</script>