<template>
  <div class="insights-page">
    <div class="page-header">
      <h1 class="page-title">AI建议与洞察</h1>
      <p class="page-subtitle">基于您的物品数据，AI为您提供个性化的消费建议</p>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-icon">
          <TrendingUpIcon class="w-8 h-8 text-green-600" />
        </div>
        <div class="card-content">
          <h3 class="card-title">本月消费</h3>
          <p class="card-value">¥{{ monthlySpending }}</p>
          <p class="card-change" :class="spendingTrend > 0 ? 'text-red-600' : 'text-green-600'">
            {{ spendingTrend > 0 ? '↑' : '↓' }} {{ Math.abs(spendingTrend) }}%
          </p>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon">
          <PackageIcon class="w-8 h-8 text-blue-600" />
        </div>
        <div class="card-content">
          <h3 class="card-title">新增物品</h3>
          <p class="card-value">{{ newItemsCount }}</p>
          <p class="card-subtitle">本月新增</p>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon">
          <AlertTriangleIcon class="w-8 h-8 text-yellow-600" />
        </div>
        <div class="card-content">
          <h3 class="card-title">重复提醒</h3>
          <p class="card-value">{{ duplicateWarnings }}</p>
          <p class="card-subtitle">待处理</p>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon">
          <LightbulbIcon class="w-8 h-8 text-purple-600" />
        </div>
        <div class="card-content">
          <h3 class="card-title">AI建议</h3>
          <p class="card-value">{{ aiRecommendations }}</p>
          <p class="card-subtitle">今日新增</p>
        </div>
      </div>
    </div>

    <!-- 消费分析 -->
    <div class="analysis-section">
      <h2 class="section-title">消费分析</h2>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <h3 class="analysis-subtitle">分类消费占比</h3>
          <div class="category-chart">
            <div v-for="category in categorySpending" :key="category.category_id" 
                 class="category-bar">
              <div class="category-info">
                <span class="category-name">{{ category.category_name }}</span>
                <span class="category-amount">¥{{ category.amount }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: category.percentage + '%' }"></div>
              </div>
              <span class="percentage">{{ category.percentage }}%</span>
            </div>
          </div>
        </div>
        
        <div class="analysis-card">
          <h3 class="analysis-subtitle">消费趋势</h3>
          <div class="trend-chart">
            <div v-for="(trend, index) in spendingTrends" :key="index" class="trend-item">
              <div class="trend-month">{{ trend.month }}</div>
              <div class="trend-bar-container">
                <div class="trend-bar" :style="{ height: (trend.amount / maxSpending) * 100 + '%' }"></div>
              </div>
              <div class="trend-amount">¥{{ trend.amount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI建议列表 -->
    <div class="suggestions-section">
      <div class="section-header">
        <h2 class="section-title">AI建议</h2>
        <div class="filter-tabs">
          <button
            v-for="tab in suggestionTabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="tab-button"
            :class="{ active: activeTab === tab.value }"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <div class="suggestions-list">
        <div v-for="suggestion in filteredSuggestions" :key="suggestion.id" 
             class="suggestion-item" :class="getSuggestionClass(suggestion.type)">
          <div class="suggestion-icon">
            <LightbulbIcon v-if="suggestion.type === 'purchase_advice'" class="w-6 h-6" />
            <TagIcon v-else-if="suggestion.type === 'category_suggestion'" class="w-6 h-6" />
            <AlertTriangleIcon v-else-if="suggestion.type === 'duplicate_warning'" class="w-6 h-6" />
            <TrendingUpIcon v-else class="w-6 h-6" />
          </div>
          
          <div class="suggestion-content">
            <div class="suggestion-header">
              <h4 class="suggestion-title">{{ suggestion.title }}</h4>
              <span class="suggestion-date">{{ formatDate(suggestion.created_at) }}</span>
            </div>
            <p class="suggestion-message">{{ suggestion.message }}</p>
            
            <div v-if="suggestion.data" class="suggestion-data">
              <!-- 根据建议类型显示相关数据 -->
              <div v-if="suggestion.type === 'duplicate_warning' && suggestion.data.similar_items">
                <div class="similar-items">
                  <p class="similar-items-title">相似物品：</p>
                  <div class="similar-items-list">
                    <div v-for="item in suggestion.data.similar_items.slice(0, 3)" :key="item.id" 
                         class="similar-item">
                      <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="similar-item-image" />
                      <div v-else class="similar-item-no-image">
                        <PackageIcon class="w-4 h-4" />
                      </div>
                      <span class="similar-item-name">{{ item.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="suggestion-actions">
              <button
                v-if="!suggestion.is_read"
                @click="markAsRead(suggestion)"
                class="btn btn-sm btn-outline"
              >
                标记已读
              </button>
              <button
                @click="handleSuggestionAction(suggestion)"
                class="btn btn-sm btn-primary"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredSuggestions.length === 0" class="empty-state">
        <LightbulbIcon class="w-16 h-16 text-gray-300 mb-4" />
        <p class="empty-text">暂无{{ getTabLabel(activeTab) }}建议</p>
      </div>
    </div>

    <!-- 消费洞察 -->
    <div class="insights-section">
      <h2 class="section-title">消费洞察</h2>
      
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon">
            <ShoppingCartIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div class="insight-content">
            <h3 class="insight-title">冲动消费提醒</h3>
            <p class="insight-text">您本月有3次短时间内连续购买同类物品的行为，建议购买前多思考。</p>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">
            <ClockIcon class="w-6 h-6 text-green-600" />
          </div>
          <div class="insight-content">
            <h3 class="insight-title">最佳购买时机</h3>
            <p class="insight-text">根据历史数据，您在月末购买物品的频率较低，价格也更优惠。</p>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">
            <TargetIcon class="w-6 h-6 text-purple-600" />
          </div>
          <div class="insight-content">
            <h3 class="insight-title">消费目标达成</h3>
            <p class="insight-text">您本季度的消费控制得很好，比预算节省了15%。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  TrendingUpIcon,
  PackageIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  ShoppingCartIcon,
  ClockIcon,
  TargetIcon,
} from 'lucide-vue-next';
import type { AISuggestion } from '@/types';
import { formatDate } from '@/utils/helpers';

// 数据
const monthlySpending = ref(2580);
const spendingTrend = ref(-12); // 负数表示下降
const newItemsCount = ref(8);
const duplicateWarnings = ref(3);
const aiRecommendations = ref(5);

const categorySpending = ref([
  { category_id: '1', category_name: '电子产品', amount: 1200, percentage: 46.5 },
  { category_id: '2', category_name: '服装配饰', amount: 580, percentage: 22.5 },
  { category_id: '3', category_name: '生活用品', amount: 400, percentage: 15.5 },
  { category_id: '4', category_name: '书籍文具', amount: 250, percentage: 9.7 },
  { category_id: '5', category_name: '其他', amount: 150, percentage: 5.8 },
]);

const spendingTrends = ref([
  { month: '1月', amount: 3200 },
  { month: '2月', amount: 2800 },
  { month: '3月', amount: 3500 },
  { month: '4月', amount: 2900 },
  { month: '5月', amount: 3100 },
  { month: '6月', amount: 2580 },
]);

const maxSpending = computed(() => 
  Math.max(...spendingTrends.value.map(t => t.amount))
);

const suggestions = ref<AISuggestion[]>([
  {
    id: '1',
    type: 'purchase_advice',
    title: '购买建议',
    description: '您最近购买了3双运动鞋，建议等待一段时间再购买类似物品，避免冲动消费。',
    message: '您最近购买了3双运动鞋，建议等待一段时间再购买类似物品，避免冲动消费。',
    is_read: false,
    confidence: 0.85,
    created_at: new Date().toISOString(),
    data: {
      similar_items: [
        { id: '1', name: '耐克运动鞋', image_url: '/api/placeholder/60/60' },
        { id: '2', name: '阿迪达斯跑鞋', image_url: '/api/placeholder/60/60' },
        { id: '3', name: '新百伦休闲鞋', image_url: '/api/placeholder/60/60' },
      ],
    },
  },
  {
    id: '2',
    type: 'duplicate_warning',
    title: '重复购买提醒',
    description: '检测到您有类似的电子产品，建议确认是否需要重复购买。',
    message: '检测到您有类似的电子产品，建议确认是否需要重复购买。',
    is_read: false,
    confidence: 0.75,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    data: {
      similar_items: [
        { id: '4', name: 'iPhone 15 Pro', image_url: '/api/placeholder/60/60' },
        { id: '5', name: 'iPhone 14 Pro', image_url: '/api/placeholder/60/60' },
      ],
    },
  },
  {
    id: '3',
    type: 'category_suggestion',
    title: '分类建议',
    description: '根据物品特征，建议将"无线蓝牙耳机"归类到"电子产品-音频设备"分类下。',
    message: '根据物品特征，建议将"无线蓝牙耳机"归类到"电子产品-音频设备"分类下。',
    is_read: true,
    confidence: 0.90,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]);

const suggestionTabs = [
  { value: 'all', label: '全部' },
  { value: 'purchase_advice', label: '购买建议' },
  { value: 'duplicate_warning', label: '重复提醒' },
  { value: 'category_suggestion', label: '分类建议' },
];

const activeTab = ref('all');

// 计算属性
const filteredSuggestions = computed(() => {
  if (activeTab.value === 'all') {
    return suggestions.value;
  }
  return suggestions.value.filter((s: AISuggestion) => s.type === activeTab.value);
});

// 方法
const getSuggestionClass = (type: string): string => {
  const classMap = {
    purchase_advice: 'suggestion-purchase',
    duplicate_warning: 'suggestion-warning',
    category_suggestion: 'suggestion-category',
  };
  return classMap[type as keyof typeof classMap] || 'suggestion-default';
};

const getTabLabel = (tabValue: string): string => {
  const tab = suggestionTabs.find(t => t.value === tabValue);
  return tab?.label || '';
};

const markAsRead = (suggestion: AISuggestion) => {
  suggestion.is_read = true;
};

const handleSuggestionAction = (suggestion: AISuggestion) => {
  console.log('处理建议:', suggestion);
  // 根据建议类型执行不同操作
  markAsRead(suggestion);
};

// 初始化
onMounted(() => {
  // 这里可以加载实际的数据
});
</script>

<style scoped>
.insights-page {
  margin-bottom: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
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

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .overview-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .overview-cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.overview-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.card-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.text-red-600 {
  color: #dc2626;
}

.text-green-600 {
  color: #16a34a;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 分析区域 */
.analysis-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .analysis-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.analysis-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.analysis-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

/* 分类消费图表 */
.category-chart {
  margin-bottom: 1rem;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 8rem;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.category-amount {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #2563eb;
  border-radius: 9999px;
}

.percentage {
  font-size: 0.875rem;
  color: #6b7280;
  width: 3rem;
  text-align: right;
}

/* 趋势图表 */
.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 8rem;
  gap: 0.5rem;
}

.trend-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.trend-month {
  font-size: 0.75rem;
  color: #6b7280;
}

.trend-bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.trend-bar {
  width: 100%;
  background-color: #2563eb;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  min-height: 8px;
}

.trend-amount {
  font-size: 0.75rem;
  color: #6b7280;
}

/* 建议列表 */
.suggestions-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: color 0.2s;
}

.tab-button.active {
  background-color: white;
  color: #2563eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-button:not(.active) {
  color: #6b7280;
}

.tab-button:not(.active):hover {
  color: #111827;
}

.suggestions-list {
  margin-bottom: 1rem;
}

.suggestion-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border-left: 4px solid;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suggestion-purchase {
  border-left-color: #3b82f6;
}

.suggestion-warning {
  border-left-color: #f59e0b;
}

.suggestion-category {
  border-left-color: #10b981;
}

.suggestion-default {
  border-left-color: #d1d5db;
}

.suggestion-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-purchase .suggestion-icon {
  background-color: #dbeafe;
  color: #2563eb;
}

.suggestion-warning .suggestion-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.suggestion-category .suggestion-icon {
  background-color: #d1fae5;
  color: #10b981;
}

.suggestion-content {
  flex: 1;
  margin-bottom: 0.75rem;
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.suggestion-title {
  font-weight: 500;
  color: #111827;
}

.suggestion-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.suggestion-message {
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.suggestion-data {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.similar-items-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.similar-items-list {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.similar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 0.375rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
}

.similar-item-image {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  object-fit: cover;
}

.similar-item-no-image {
  width: 2rem;
  height: 2rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.similar-item-name {
  font-size: 0.75rem;
  color: #374151;
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-text {
  color: #6b7280;
}

/* 洞察区域 */
.insights-section {
  margin-bottom: 1.5rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .insights-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.insight-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.insight-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-600 {
  color: #2563eb;
}

.bg-green-100 {
  background-color: #d1fae5;
}

.text-green-600 {
  color: #10b981;
}

.bg-purple-100 {
  background-color: #e9d5ff;
}

.text-purple-600 {
  color: #9333ea;
}

.insight-content {
  flex: 1;
  margin-bottom: 0.5rem;
}

.insight-title {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.insight-text {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 按钮样式 */
.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-outline {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background-color: #f9fafb;
  color: #374151;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
</style>