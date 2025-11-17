<template>
  <div class="ai-test-page">
    <div class="page-header">
      <h1 class="page-title">AI分类测试</h1>
      <p class="page-subtitle">测试AI分类推荐的准确性</p>
    </div>

    <div class="test-container">
      <!-- 测试输入区域 -->
      <div class="test-section">
        <h2 class="section-title">测试输入</h2>
        
        <div class="form-group">
          <label class="form-label">物品名称</label>
          <input
            v-model="testItem.name"
            type="text"
            class="form-input"
            placeholder="请输入物品名称"
            @input="testAICategory"
          />
        </div>

        <div class="form-group">
          <label class="form-label">物品描述</label>
          <textarea
            v-model="testItem.description"
            rows="3"
            class="form-textarea"
            placeholder="请输入物品描述"
            @input="testAICategory"
          ></textarea>
        </div>

        <div class="quick-tests">
          <h3 class="quick-test-title">快速测试用例</h3>
          <div class="test-cases">
            <button
              v-for="testCase in testCases"
              :key="testCase.name"
              type="button"
              @click="applyTestCase(testCase)"
              class="test-case-btn"
            >
              {{ testCase.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- AI分类结果 -->
      <div v-if="aiSuggestion" class="test-section">
        <h2 class="section-title">AI分类结果</h2>
        
        <div class="result-card">
          <div class="result-header">
            <h3 class="suggested-category">{{ aiSuggestion.category_name }}</h3>
            <span class="confidence-badge" :class="getConfidenceClass(aiSuggestion.confidence)">
              {{ Math.round(aiSuggestion.confidence * 100) }}% 置信度
            </span>
          </div>
          
          <div class="result-reasons">
            <h4 class="reasons-title">推荐理由：</h4>
            <ul class="reasons-list">
              <li v-for="reason in aiSuggestion.reasons" :key="reason" class="reason-item">
                {{ reason }}
              </li>
            </ul>
          </div>

          <div v-if="aiSuggestion.alternatives && aiSuggestion.alternatives.length > 0" class="alternatives">
            <h4 class="alternatives-title">备选分类：</h4>
            <div class="alternatives-list">
              <div
                v-for="alt in aiSuggestion.alternatives"
                :key="alt.category_id"
                class="alternative-item"
              >
                <span class="alt-category">{{ alt.category_name }}</span>
                <span class="alt-confidence">{{ Math.round(alt.confidence * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类对比 -->
      <div class="test-section">
        <h2 class="section-title">所有分类得分</h2>
        <div class="categories-comparison">
          <div
            v-for="category in allCategoriesWithScores"
            :key="category.id"
            class="category-score-item"
            :class="{ 'best-match': category.id === aiSuggestion?.category_id }"
          >
            <span class="category-name">{{ category.name }}</span>
            <div class="score-bar">
              <div
                class="score-fill"
                :style="{ width: `${category.score * 100}%` }"
                :class="getScoreClass(category.score)"
              ></div>
            </div>
            <span class="score-text">{{ Math.round(category.score * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { categoryService } from '@/composables/useSupabase';
import type { Category } from '@/types';

// 测试数据
const testItem = ref({
  name: '',
  description: ''
});

const aiSuggestion = ref<any>(null);
const allCategories = ref<Category[]>([]);
const isLoading = ref(false);

// 快速测试用例
const testCases = [
  {
    name: 'iPhone 14',
    item: {
      name: 'iPhone 14 Pro Max',
      description: '苹果最新款手机，深空黑色，256GB存储'
    }
  },
  {
    name: '运动鞋',
    item: {
      name: 'Nike Air Max 270',
      description: '耐克气垫跑鞋，黑色，适合日常运动和跑步'
    }
  },
  {
    name: '咖啡机',
    item: {
      name: '德龙全自动咖啡机',
      description: '意式浓缩咖啡机，带奶泡功能，适合家庭使用'
    }
  },
  {
    name: '编程书籍',
    item: {
      name: 'JavaScript高级程序设计',
      description: '前端开发必读书籍，涵盖ES6+新特性'
    }
  },
  {
    name: '护肤品',
    item: {
      name: '兰蔻小黑瓶精华液',
      description: '抗衰老精华，改善肌肤细纹，保湿滋润'
    }
  }
];

// 计算属性
const allCategoriesWithScores = computed(() => {
  if (!aiSuggestion.value) return [];
  
  // 这里可以根据AI算法的内部逻辑获取所有分类的得分
  // 现在只返回推荐分类
  return [{
    id: aiSuggestion.value.category_id,
    name: aiSuggestion.value.category_name,
    score: aiSuggestion.value.confidence
  }];
});

// 方法
const testAICategory = async () => {
  if (!testItem.value.name && !testItem.value.description) {
    aiSuggestion.value = null;
    return;
  }

  isLoading.value = true;
  
  try {
    const suggestion = await categoryService.getAICategorySuggestion({
      name: testItem.value.name,
      description: testItem.value.description,
      userId: 'demo-user'
    });
    
    aiSuggestion.value = suggestion;
  } catch (error) {
    console.error('AI分类测试失败:', error);
    aiSuggestion.value = null;
  } finally {
    isLoading.value = false;
  }
};

const applyTestCase = (testCase: any) => {
  testItem.value = { ...testCase.item };
  testAICategory();
};

const getConfidenceClass = (confidence: number): string => {
  if (confidence >= 0.8) return 'confidence-high';
  if (confidence >= 0.6) return 'confidence-medium';
  return 'confidence-low';
};

const getScoreClass = (score: number): string => {
  if (score >= 0.8) return 'score-high';
  if (score >= 0.6) return 'score-medium';
  return 'score-low';
};

// 初始化
onMounted(async () => {
  try {
    allCategories.value = await categoryService.getCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
  }
});
</script>

<style scoped>
.ai-test-page {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b7280;
}

.test-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.test-section {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-textarea {
  resize: none;
}

.quick-tests {
  margin-top: 1.5rem;
}

.quick-test-title {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.75rem;
}

.test-cases {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.test-case-btn {
  padding: 0.25rem 0.75rem;
  background-color: #e0f2fe;
  color: #075985;
  font-size: 0.875rem;
  border-radius: 9999px;
  transition: color 0.2s, background-color 0.2s;
  border: none;
  cursor: pointer;
}

.test-case-btn:hover {
  background-color: #bae6fd;
}

.result-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.suggested-category {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.confidence-badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 9999px;
  font-weight: 500;
}

.confidence-high {
  background-color: #d1fae5;
  color: #065f46;
}

.confidence-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.confidence-low {
  background-color: #fee2e2;
  color: #991b1b;
}

.result-reasons {
  margin-bottom: 1rem;
}

.reasons-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.reasons-list {
  list-style: disc;
  padding-left: 1rem;
}

.reason-item {
  font-size: 0.875rem;
  color: #6b7280;
}

.alternatives {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.alternatives-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alternative-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.alt-category {
  color: #111827;
}

.alt-confidence {
  color: #6b7280;
}

.categories-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-score-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.category-score-item.best-match {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
}

.category-name {
  width: 6rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.score-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.score-high {
  background-color: #22c55e;
}

.score-medium {
  background-color: #f59e0b;
}

.score-low {
  background-color: #ef4444;
}

.score-text {
  width: 3rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
}
</style>
