<template>
  <div class="ai-test-container">
    <h1>AI分类测试</h1>
    <div class="test-section">
      <h3>输入测试数据</h3>
      <div class="form-group">
        <label>物品名称：</label>
        <input v-model="testName" placeholder="例如：iPhone 14 Pro Max">
      </div>
      <div class="form-group">
        <label>物品描述：</label>
        <textarea v-model="testDescription" placeholder="例如：苹果最新款手机，深空黑色，256GB存储"></textarea>
      </div>
      <button @click="testAICategory" class="test-btn">测试AI分类</button>
    </div>
    
    <div v-if="result" class="result-section">
      <h3>AI分类结果</h3>
      <div class="result-card">
        <div class="result-header">
          <span class="category">{{ result.category_name }}</span>
          <span class="confidence" :class="getConfidenceClass(result.confidence)">
            {{ Math.round(result.confidence * 100) }}% 置信度
          </span>
        </div>
        <div class="reasons">
          <h4>推荐理由：</h4>
          <ul>
            <li v-for="reason in result.reasons" :key="reason">{{ reason }}</li>
          </ul>
        </div>
        <div v-if="result.alternatives && result.alternatives.length > 0" class="alternatives">
          <h4>备选分类：</h4>
          <div v-for="alt in result.alternatives" :key="alt.category_id" class="alternative">
            <span>{{ alt.category_name }}</span>
            <span>{{ Math.round(alt.confidence * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="quick-tests">
      <h3>快速测试用例</h3>
      <button v-for="testCase in testCases" :key="testCase.name" @click="runQuickTest(testCase)" class="quick-test-btn">
        {{ testCase.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { categoryService } from '@/composables/useSupabase';

const testName = ref('');
const testDescription = ref('');
const result = ref<any>(null);
const isLoading = ref(false);

const testCases = [
  {
    name: 'iPhone 14 Pro Max',
    description: '苹果最新款手机，深空黑色，256GB存储'
  },
  {
    name: 'Nike Air Max 270',
    description: '耐克气垫跑鞋，黑色，适合日常运动和跑步'
  },
  {
    name: '德龙全自动咖啡机',
    description: '意式浓缩咖啡机，带奶泡功能，适合家庭使用'
  },
  {
    name: 'JavaScript高级程序设计',
    description: '前端开发必读书籍，涵盖ES6+新特性'
  },
  {
    name: '兰蔻小黑瓶精华液',
    description: '抗衰老精华，改善肌肤细纹，保湿滋润'
  }
];

const testAICategory = async () => {
  if (!testName.value && !testDescription.value) {
    alert('请输入物品名称或描述');
    return;
  }
  
  isLoading.value = true;
  
  try {
    const suggestion = await categoryService.getAICategorySuggestion({
      name: testName.value,
      description: testDescription.value,
      userId: 'demo-user'
    });
    
    result.value = suggestion;
    console.log('AI分类结果:', suggestion);
  } catch (error) {
    console.error('AI分类测试失败:', error);
    alert('测试失败，请查看控制台错误信息');
  } finally {
    isLoading.value = false;
  }
};

const runQuickTest = (testCase: any) => {
  testName.value = testCase.name;
  testDescription.value = testCase.description;
  testAICategory();
};

const getConfidenceClass = (confidence: number): string => {
  if (confidence >= 0.8) return 'confidence-high';
  if (confidence >= 0.6) return 'confidence-medium';
  return 'confidence-low';
};
</script>

<style scoped>
.ai-test-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

h3 {
  color: #555;
  margin-bottom: 1rem;
}

.test-section, .result-section, .quick-tests {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  height: 80px;
  resize: vertical;
}

.test-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #0056b3;
}

.test-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-card {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.category {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.confidence {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.confidence-high {
  background: #d4edda;
  color: #155724;
}

.confidence-medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-low {
  background: #f8d7da;
  color: #721c24;
}

.reasons h4, .alternatives h4 {
  color: #555;
  margin-bottom: 0.5rem;
}

.reasons ul {
  margin: 0;
  padding-left: 1.5rem;
}

.reasons li {
  color: #666;
  margin-bottom: 0.25rem;
}

.alternative {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.quick-test-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.quick-test-btn:hover {
  background: #218838;
}
</style>