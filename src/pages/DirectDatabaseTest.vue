<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">数据库连接测试</h1>
      
      <!-- 直接数据库测试 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">直接数据库连接测试</h2>
        <button 
          @click="testDirectConnection"
          class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full"
        >
          测试直接数据库连接
        </button>
        
        <div v-if="directResult" class="mt-4 p-4 rounded" :class="directResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="directResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ directResult.success ? '✅ 连接成功' : '❌ 连接失败' }}
          </p>
          <div v-if="directResult.error" class="mt-2">
            <p><strong>错误类型:</strong> {{ directResult.errorType }}</p>
            <p><strong>错误信息:</strong> {{ directResult.errorMessage }}</p>
            <p><strong>完整错误:</strong></p>
            <pre class="text-sm bg-gray-100 p-2 rounded mt-1 text-red-700">{{ directResult.fullError }}</pre>
          </div>
        </div>
      </div>

      <!-- 权限检查 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">权限检查</h2>
        <button 
          @click="checkPermissions"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          检查数据库权限
        </button>
        
        <div v-if="permissionResult" class="mt-4 p-4 rounded" :class="permissionResult.success ? 'bg-green-50' : 'bg-red-50'">
          <p :class="permissionResult.success ? 'text-green-800' : 'text-red-800'" class="font-semibold mb-2">
            {{ permissionResult.success ? '✅ 权限正常' : '❌ 权限问题' }}
          </p>
          <div v-if="permissionResult.details" class="mt-2">
            <pre class="text-sm bg-gray-100 p-2 rounded">{{ permissionResult.details }}</pre>
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
import { useAuth } from '@/composables/useAuth';

const { userId } = useAuth();

const logs = ref<string[]>([]);
const directResult = ref<any>(null);
const permissionResult = ref<any>(null);

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

async function testDirectConnection() {
  directResult.value = null;
  
  try {
    addLog('开始直接数据库连接测试...');
    addLog('用户ID', userId.value);
    
    // 获取 Supabase 客户端信息
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addLog('Supabase URL', supabaseUrl);
    addLog('Supabase Key 存在', !!supabaseKey);
    
    // 尝试最简单的查询
    addLog('尝试最简单的查询...');
    
    // 使用 fetch 直接测试
    const response = await fetch(`${supabaseUrl}/rest/v1/items?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    addLog('HTTP 响应状态', response.status);
    addLog('HTTP 响应状态文本', response.statusText);
    
    const responseText = await response.text();
    addLog('原始响应文本', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      addLog('解析后的响应数据', responseData);
    } catch (parseError) {
      addLog('响应解析失败', parseError);
      responseData = responseText;
    }
    
    directResult.value = {
      success: true,
      message: '✅ 直接连接成功',
      data: responseData
    };
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    const errorStack = (error as Error).stack;
    
    addLog('直接连接失败', {
      message: errorMessage,
      stack: errorStack
    });
    
    directResult.value = {
      success: false,
      errorType: 'Connection Error',
      errorMessage: errorMessage,
      fullError: JSON.stringify(error, null, 2)
    };
  }
}

async function checkPermissions() {
  permissionResult.value = null;
  
  try {
    addLog('开始权限检查...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // 检查 items 表权限
    addLog('检查 items 表权限...');
    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/items?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    addLog('Items 表响应状态', itemsResponse.status);
    
    // 检查 categories 表权限
    addLog('检查 categories 表权限...');
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    addLog('Categories 表响应状态', categoriesResponse.status);
    
    // 检查 subcategories 表权限
    addLog('检查 subcategories 表权限...');
    const subcategoriesResponse = await fetch(`${supabaseUrl}/rest/v1/subcategories?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    addLog('Subcategories 表响应状态', subcategoriesResponse.status);
    
    // 尝试插入测试数据
    addLog('尝试插入测试数据...');
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/items`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId.value,
        name: '权限测试物品',
        condition: 'good',
        quantity: 1
      })
    });
    
    addLog('插入响应状态', insertResponse.status);
    
    if (insertResponse.ok) {
      const insertData = await insertResponse.json();
      addLog('插入成功', insertData);
      
      // 清理测试数据
      if (insertData[0]?.id) {
        addLog('清理测试数据...');
        await fetch(`${supabaseUrl}/rest/v1/items?id=eq.${insertData[0].id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });
        addLog('测试数据已清理');
      }
    } else {
      const errorText = await insertResponse.text();
      addLog('插入失败', errorText);
    }
    
    permissionResult.value = {
      success: true,
      message: '✅ 权限检查完成',
      details: JSON.stringify({
        items: itemsResponse.status,
        categories: categoriesResponse.status,
        subcategories: subcategoriesResponse.status,
        insert: insertResponse.status
      }, null, 2)
    };
    
  } catch (error) {
    const errorMessage = (error as Error).message;
    addLog('权限检查失败', error);
    
    permissionResult.value = {
      success: false,
      message: '❌ 权限检查失败',
      details: errorMessage
    };
  }
}
</script>