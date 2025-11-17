<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">简化添加物品</h1>
      
      <!-- 基本信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">基本信息</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">物品名称 *</label>
          <input 
            v-model="itemName" 
            type="text" 
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="请输入物品名称"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
          <textarea 
            v-model="itemDescription" 
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="请输入物品描述"
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select v-model="categoryId" class="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <select v-model="condition" class="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="new">全新</option>
            <option value="like_new">几乎全新</option>
            <option value="good">良好</option>
            <option value="fair">一般</option>
            <option value="poor">较差</option>
          </select>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <button 
          @click="simpleSave"
          :disabled="!itemName || loading"
          class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 w-full"
        >
          {{ loading ? '保存中...' : '简化保存' }}
        </button>
        
        <div v-if="result" class="mt-4 p-4 rounded" :class="result.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="result.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ result.success ? '✅ 保存成功' : '❌ 保存失败' }}
          </p>
          <div v-if="result.data" class="space-y-1">
            <p><strong>物品ID:</strong> {{ result.data.id }}</p>
            <p><strong>名称:</strong> {{ result.data.name }}</p>
          </div>
          <div v-if="result.error" class="mt-2">
            <p><strong>错误信息:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ JSON.stringify(result.error, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 日志 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">调试日志</h2>
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
import { ref, onMounted } from 'vue';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/composables/useAuth';
import type { Category } from '@/types';

const { userId } = useAuth();

const itemName = ref('');
const itemDescription = ref('');
const categoryId = ref('');
const condition = ref('good');
const loading = ref(false);
const result = ref<any>(null);
const categories = ref<Category[]>([]);
const logs = ref<string[]>([]);

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

async function loadCategories() {
  try {
    addLog('加载分类...');
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      addLog('加载分类失败', error);
      return;
    }
    categories.value = data || [];
    addLog('分类加载成功', data);
  } catch (error) {
    addLog('加载分类出错', error);
  }
}

async function simpleSave() {
  if (!itemName.value.trim()) {
    alert('请输入物品名称');
    return;
  }
  
  loading.value = true;
  result.value = null;
  
  try {
    addLog('开始简化保存...');
    addLog('用户ID', userId.value);
    
    // 准备最简单的数据
    const itemData = {
      user_id: userId.value,
      name: itemName.value.trim(),
      description: itemDescription.value.trim() || undefined,
      condition: condition.value,
      category_id: categoryId.value || undefined,
      quantity: 1
    };
    
    addLog('准备保存的数据', itemData);
    
    // 直接使用 Supabase 客户端
    addLog('使用 Supabase 客户端插入数据...');
    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) {
      addLog('保存失败', error);
      result.value = {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error
        }
      };
      return;
    }
    
    addLog('保存成功', data);
    
    result.value = {
      success: true,
      data: data
    };
    
    // 清空表单
    itemName.value = '';
    itemDescription.value = '';
    categoryId.value = '';
    condition.value = 'good';
    
    alert('物品保存成功！');
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    addLog('保存时出错', error);
    result.value = {
      success: false,
      error: {
        message: errorMessage,
        stack: (error as Error).stack
      }
    };
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCategories();
});
</script>