<template>
  <div class="home-container">
    <h1>SeeIt - AI物品分类测试</h1>
    <p class="subtitle">测试AI自动分类功能</p>
    
    <div class="test-section">
      <h2>AI分类测试</h2>
      <div class="input-group">
        <label>物品名称：</label>
        <input 
          v-model="itemName" 
          placeholder="例如：iPhone 14 Pro Max"
          class="input-field"
        >
      </div>
      
      <div class="input-group">
        <label>物品描述：</label>
        <textarea 
          v-model="itemDescription" 
          placeholder="例如：苹果最新款手机，深空黑色，256GB存储"
          class="textarea-field"
        ></textarea>
      </div>
      
      <button @click="testClassification" class="test-button" :disabled="isLoading">
        {{ isLoading ? '分析中...' : '测试AI分类' }}
      </button>
    </div>
    
    <div v-if="classificationResult" class="result-section">
      <h2>分类结果</h2>
      <div class="result-card">
        <div class="result-header">
          <h3>{{ classificationResult.category_name }}</h3>
          <span class="confidence-score" :class="getConfidenceClass(classificationResult.confidence)">
            置信度: {{ Math.round(classificationResult.confidence * 100) }}%
          </span>
        </div>
        
        <div class="reasons-section">
          <h4>分析依据：</h4>
          <ul>
            <li v-for="reason in classificationResult.reasons" :key="reason">
              {{ reason }}
            </li>
          </ul>
        </div>
        
        <div v-if="classificationResult.alternatives && classificationResult.alternatives.length > 0" class="alternatives-section">
          <h4>其他可能分类：</h4>
          <div class="alternatives-list">
            <div v-for="alt in classificationResult.alternatives" :key="alt.category_id" class="alternative-item">
              <span>{{ alt.category_name }}</span>
              <span class="alt-confidence">{{ Math.round(alt.confidence * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="quick-tests-section">
      <h2>快速测试</h2>
      <div class="quick-test-buttons">
        <button 
          v-for="testCase in quickTestCases" 
          :key="testCase.name"
          @click="runQuickTest(testCase)"
          class="quick-test-btn"
        >
          {{ testCase.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { categoryService } from '@/composables/useSupabase'

const itemName = ref('')
const itemDescription = ref('')
const classificationResult = ref<any>(null)
const isLoading = ref(false)

const quickTestCases = [
  {
    name: 'iPhone 14 Pro Max',
    description: '苹果最新款手机，深空黑色，256GB存储，A16芯片'
  },
  {
    name: 'Nike Air Max 270运动鞋',
    description: '耐克气垫跑鞋，黑色配色，适合日常运动和跑步锻炼'
  },
  {
    name: '德龙全自动咖啡机',
    description: '意式浓缩咖啡机，带奶泡功能，适合家庭使用，制作拿铁和卡布奇诺'
  },
  {
    name: 'JavaScript高级程序设计第4版',
    description: '前端开发必读书籍，涵盖ES6+新特性，Vue.js和React框架详解'
  },
  {
    name: '兰蔻小黑瓶精华液',
    description: '抗衰老精华，改善肌肤细纹，保湿滋润，适合熟龄肌肤使用'
  },
  {
    name: '戴森V11吸尘器',
    description: '无线手持吸尘器，强力吸力，适合地毯和硬地板清洁'
  }
]

const testClassification = async () => {
  if (!itemName.value.trim() && !itemDescription.value.trim()) {
    alert('请输入物品名称或描述')
    return
  }
  
  isLoading.value = true
  classificationResult.value = null
  
  try {
    const result = await categoryService.getAICategorySuggestion({
      name: itemName.value,
      description: itemDescription.value,
      userId: 'demo-user'
    })
    
    classificationResult.value = result
    console.log('AI分类结果:', result)
  } catch (error) {
    console.error('AI分类失败:', error)
    alert('分类失败，请查看控制台错误信息')
  } finally {
    isLoading.value = false
  }
}

const runQuickTest = (testCase: any) => {
  itemName.value = testCase.name
  itemDescription.value = testCase.description
  testClassification()
}

const getConfidenceClass = (confidence: number): string => {
  if (confidence >= 0.8) return 'confidence-high'
  if (confidence >= 0.6) return 'confidence-medium'
  return 'confidence-low'
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 3rem;
  font-size: 1.2rem;
}

.test-section, .result-section, .quick-tests-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

h3 {
  color: #34495e;
  margin-bottom: 1rem;
}

h4 {
  color: #7f8c8d;
  margin-bottom: 0.8rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-field:focus, .textarea-field:focus {
  outline: none;
  border-color: #3498db;
}

.textarea-field {
  height: 100px;
  resize: vertical;
}

.test-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
}

.test-button:hover:not(:disabled) {
  background: #2980b9;
}

.test-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.confidence-score {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
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

.reasons-section, .alternatives-section {
  margin-bottom: 1.5rem;
}

.reasons-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.reasons-section li {
  color: #6c757d;
  margin-bottom: 0.3rem;
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
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.alt-confidence {
  color: #6c757d;
  font-weight: 500;
}

.quick-test-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.quick-test-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.quick-test-btn:hover {
  background: #229954;
}
</style>