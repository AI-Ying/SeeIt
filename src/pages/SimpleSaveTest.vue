<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">简单保存测试</h1>
      
      <!-- 基本信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">基本信息</h2>
        <div class="bg-gray-50 p-4 rounded space-y-2">
          <p><strong>用户ID:</strong> <span class="text-sm">{{ userId }}</span></p>
          <p><strong>状态:</strong> <span class="text-sm">{{ status }}</span></p>
        </div>
      </div>

      <!-- 快速保存测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">快速保存测试</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">物品名称</label>
          <input 
            v-model="itemName" 
            type="text" 
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="输入物品名称"
          >
        </div>
        <button 
          @click="quickSaveTest"
          :disabled="!itemName || loading"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 w-full"
        >
          {{ loading ? '保存中...' : '快速保存测试' }}
        </button>
        
        <div v-if="result" class="mt-4 p-4 rounded" :class="result.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="result.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ result.success ? '✅ 保存成功' : '❌ 保存失败' }}
          </p>
          <div v-if="result.data" class="space-y-1">
            <p><strong>物品ID:</strong> {{ result.data.id }}</p>
            <p><strong>名称:</strong> {{ result.data.name }}</p>
            <p><strong>创建时间:</strong> {{ new Date(result.data.created_at).toLocaleString() }}</p>
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
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/composables/useAuth';

const { userId } = useAuth();

const itemName = ref('');
const logs = ref<string[]>([]);
const loading = ref(false);
const result = ref<any>(null);
const status = ref('就绪');

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

async function quickSaveTest() {
  if (!itemName.value.trim()) return;
  
  loading.value = true;
  result.value = null;
  status.value = '测试中...';
  
  try {
    addLog('开始简单保存测试...');
    addLog('用户ID', userId.value);
    addLog('物品名称', itemName.value);
    
    // 创建最简单的物品数据
    const itemData = {
      user_id: userId.value,
      name: itemName.value.trim(),
      condition: 'good',
      quantity: 1
    };
    
    addLog('准备保存的数据', itemData);
    
    // 直接使用 Supabase 客户端保存
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
    
    // 清理测试数据
    if (data?.id) {
      addLog('清理测试数据...');
      await supabase.from('items').delete().eq('id', data.id);
      addLog('测试数据已清理');
    }
    
    status.value = '测试完成';
    
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
    status.value = '测试失败';
  } finally {
    loading.value = false;
  }
}
</script>