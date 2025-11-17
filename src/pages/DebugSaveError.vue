<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">保存错误调试</h1>
      
      <!-- 错误捕获测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">错误捕获测试</h2>
        <button 
          @click="testSaveWithDetailedError"
          class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full"
        >
          测试保存并捕获详细错误
        </button>
        
        <div v-if="errorResult" class="mt-4 p-4 rounded" :class="errorResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="errorResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ errorResult.success ? '✅ 保存成功' : '❌ 保存失败' }}
          </p>
          <div v-if="errorResult.error" class="mt-2">
            <p><strong>错误类型:</strong> {{ errorResult.errorType }}</p>
            <p><strong>错误信息:</strong> {{ errorResult.errorMessage }}</p>
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ errorResult.errorDetails }}</pre>
          </div>
        </div>
      </div>

      <!-- 环境检查 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">环境检查</h2>
        <div class="space-y-2">
          <p><strong>Supabase URL:</strong> <span class="text-sm">{{ supabaseUrl || '未配置' }}</span></p>
          <p><strong>Supabase Key:</strong> <span class="text-sm">{{ supabaseKey ? '已配置' : '未配置' }}</span></p>
          <p><strong>用户ID:</strong> <span class="text-sm">{{ userId }}</span></p>
        </div>
      </div>

      <!-- 原始数据库测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">原始数据库测试</h2>
        <button 
          @click="testRawDatabase"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          测试原始数据库连接
        </button>
        
        <div v-if="rawResult" class="mt-4 p-4 rounded" :class="rawResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="rawResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ rawResult.success ? '✅ 连接成功' : '❌ 连接失败' }}
          </p>
          <div v-if="rawResult.error" class="mt-2">
            <p><strong>错误详情:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ rawResult.error }}</pre>
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
import { ref } from 'vue';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/composables/useAuth';

const { userId } = useAuth();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const logs = ref<string[]>([]);
const errorResult = ref<any>(null);
const rawResult = ref<any>(null);

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

async function testSaveWithDetailedError() {
  errorResult.value = null;
  
  try {
    addLog('开始详细错误捕获测试...');
    
    // 准备测试数据
    const testData = {
      user_id: userId.value,
      name: '测试物品',
      condition: 'good',
      quantity: 1
    };
    
    addLog('测试数据', testData);
    
    // 尝试直接插入数据
    addLog('尝试直接插入数据...');
    const { data, error } = await supabase
      .from('items')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      addLog('保存失败，捕获详细错误', error);
      
      errorResult.value = {
        success: false,
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorDetails: JSON.stringify(error, null, 2),
        error: error
      };
      
      // 尝试获取更多信息
      addLog('尝试获取错误代码', error.code);
      addLog('尝试获取错误详情', error.details);
      addLog('尝试获取错误提示', error.hint);
      
      return;
    }
    
    addLog('保存成功', data);
    
    errorResult.value = {
      success: true,
      data: data,
      message: '✅ 保存成功'
    };
    
    // 清理测试数据
    if (data?.id) {
      addLog('清理测试数据...');
      await supabase.from('items').delete().eq('id', data.id);
      addLog('测试数据已清理');
    }
    
  } catch (catchError) {
    const errorMessage = (catchError as Error).message;
    const errorStack = (catchError as Error).stack;
    
    addLog('捕获到异常', {
      message: errorMessage,
      stack: errorStack
    });
    
    errorResult.value = {
      success: false,
      errorType: 'JavaScript Error',
      errorMessage: errorMessage,
      errorDetails: errorStack || JSON.stringify(catchError, null, 2),
      error: catchError
    };
  }
}

async function testRawDatabase() {
  rawResult.value = null;
  
  try {
    addLog('开始原始数据库测试...');
    
    // 测试基本连接
    addLog('测试基本连接...');
    const { data: connectionData, error: connectionError } = await supabase
      .from('items')
      .select('count');
    
    if (connectionError) {
      addLog('连接失败', connectionError);
      rawResult.value = {
        success: false,
        error: JSON.stringify(connectionError, null, 2)
      };
      return;
    }
    
    addLog('连接成功', connectionData);
    
    // 测试权限
    addLog('测试权限...');
    const { data: permissionData, error: permissionError } = await supabase
      .from('items')
      .select('id')
      .limit(1);
    
    if (permissionError) {
      addLog('权限测试失败', permissionError);
      rawResult.value = {
        success: false,
        error: JSON.stringify(permissionError, null, 2)
      };
      return;
    }
    
    addLog('权限测试通过', permissionData);
    
    rawResult.value = {
      success: true,
      message: '✅ 数据库连接和权限测试通过'
    };
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    addLog('数据库测试时出错', error);
    
    rawResult.value = {
      success: false,
      error: JSON.stringify(error, null, 2)
    };
  }
}
</script>