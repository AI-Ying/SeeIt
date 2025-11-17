<template>
  <div class="search-page">
    <div class="page-header">
      <h1 class="page-title">智能搜索</h1>
      <p class="page-subtitle">搜索您的物品，避免重复购买</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-box">
        <SearchIcon class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="输入要搜索的物品名称、描述或标签..."
          class="search-input"
          @keyup.enter="handleSearch"
          @input="handleSearchInput"
        />
        <button
          @click="handleSearch"
          class="search-btn"
          :disabled="!searchQuery.trim() || isSearching"
        >
          <SearchIcon class="w-5 h-5" />
          {{ isSearching ? '搜索中...' : '搜索' }}
        </button>
      </div>
      
      <!-- 搜索建议 -->
      <div v-if="searchSuggestions.length > 0" class="search-suggestions">
        <div class="suggestions-header">搜索建议</div>
        <div class="suggestions-list">
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            @click="applySuggestion(suggestion)"
            class="suggestion-item"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- 高级筛选 -->
    <div class="advanced-filters">
      <button @click="toggleFilters" class="filter-toggle">
        <FilterIcon class="w-4 h-4 mr-2" />
        高级筛选
        <ChevronDownIcon class="w-4 h-4 ml-1" :class="{ 'rotate-180': showFilters }" />
      </button>
      
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-grid">
          <div class="filter-group">
            <label class="filter-label">分类</label>
            <select v-model="filters.category_ids" multiple class="filter-select">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">状态</label>
            <div class="checkbox-group">
              <label v-for="condition in conditions" :key="condition.value" class="checkbox-label">
                <input
                  type="checkbox"
                  :value="condition.value"
                  v-model="filters.condition"
                  class="checkbox-input"
                />
                <span>{{ condition.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">价格范围</label>
            <div class="price-range">
              <input
                v-model.number="filters.price_range.min_price"
                type="number"
                placeholder="最低价格"
                class="price-input"
              />
              <span class="price-separator">-</span>
              <input
                v-model.number="filters.price_range.max_price"
                type="number"
                placeholder="最高价格"
                class="price-input"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">购买日期</label>
            <div class="date-range">
              <input
                v-model="filters.date_range.start_date"
                type="date"
                class="date-input"
              />
              <span class="date-separator">至</span>
              <input
                v-model="filters.date_range.end_date"
                type="date"
                class="date-input"
              />
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="clearFilters" class="btn btn-secondary">
            清除筛选
          </button>
          <button @click="applyFilters" class="btn btn-primary">
            应用筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <div v-if="isSearching" class="searching-state">
        <div class="searching-spinner"></div>
        <p class="searching-text">正在搜索您的物品...</p>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="results-section">
        <div class="results-header">
          <h3 class="results-title">
            找到 {{ searchResults.length }} 个相关物品
          </h3>
          <div class="results-stats">
            <span>搜索用时: {{ searchTime }}ms</span>
          </div>
        </div>
        
        <div class="results-grid">
          <div v-for="item in searchResults" :key="item.id" class="result-card">
            <div class="result-image">
              <img v-if="item.image_urls?.[0]" :src="item.image_urls[0]" :alt="item.name" />
              <div v-else class="no-image">
                <PackageIcon class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            
            <div class="result-content">
              <div class="result-header">
                <h4 class="result-name">{{ item.name }}</h4>
                <div class="similarity-score" v-if="item.similarity_score">
                  {{ Math.round(item.similarity_score * 100) }}%
                </div>
              </div>
              
              <p class="result-description">{{ item.description || '暂无描述' }}</p>
              
              <div class="result-meta">
                <div class="meta-item">
                  <TagIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ getCategoryName(item.category_id) }}</span>
                </div>
                <div v-if="item.purchase_price" class="meta-item">
                  <span class="result-price">¥{{ item.purchase_price }}</span>
                </div>
              </div>
              
              <div class="result-tags" v-if="item.tags?.length">
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="result-actions">
              <router-link :to="`/item/${item.id}`" class="btn btn-sm btn-outline">
                查看详情
              </router-link>
              <button @click="viewSimilarItems(item)" class="btn btn-sm btn-primary">
                找相似
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="hasSearched" class="no-results">
        <SearchIcon class="w-16 h-16 text-gray-300 mb-4" />
        <h3 class="no-results-title">未找到相关物品</h3>
        <p class="no-results-text">您可以尝试：</p>
        <ul class="suggestions-list">
          <li>• 检查拼写是否正确</li>
          <li>• 尝试使用不同的关键词</li>
          <li>• 调整筛选条件</li>
        </ul>
      </div>
      
      <div v-else class="search-prompt">
        <SearchIcon class="w-16 h-16 text-gray-300 mb-4" />
        <h3 class="prompt-title">开始搜索您的物品</h3>
        <p class="prompt-text">输入关键词搜索您已拥有的物品，避免重复购买</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  PackageIcon,
  TagIcon,
} from 'lucide-vue-next';
import { itemService, categoryService } from '@/composables/useSupabase';
interface SearchResultItem extends Item {
  similarity_score?: number;
}

import type { Item, Category, SearchFilters as SearchFiltersType } from '@/types';
import { debounce } from '@/utils/helpers';

// 数据
const searchQuery = ref('');
const searchSuggestions = ref<string[]>([]);
const searchResults = ref<SearchResultItem[]>([]);
const categories = ref<Category[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const searchTime = ref(0);
const showFilters = ref(false);

const filters = ref<SearchFiltersType>({
  category_ids: [],
  condition: '',
  price_range: {
    min_price: 0,
    max_price: 0,
  },
  date_range: {
    start_date: '',
    end_date: '',
  },
});

const conditions = [
  { value: 'new', label: '全新' },
  { value: 'like_new', label: '几乎全新' },
  { value: 'good', label: '良好' },
  { value: 'fair', label: '一般' },
  { value: 'poor', label: '较差' },
];

// 方法
const handleSearchInput = debounce(() => {
  if (searchQuery.value.trim()) {
    generateSuggestions();
  } else {
    searchSuggestions.value = [];
  }
}, 300);

const generateSuggestions = () => {
  // 基于搜索历史生成建议（模拟）
  const query = searchQuery.value.toLowerCase();
  const mockSuggestions = [
    '手机', '电脑', '耳机', '键盘', '鼠标', '充电器', '数据线',
    '衣服', '鞋子', '包包', '手表', '眼镜', '帽子', '围巾',
    '书籍', '笔记本', '笔', '文件夹', '打印机', '扫描仪',
    '咖啡', '茶叶', '杯子', '餐具', '锅具', '调料',
  ];
  
  searchSuggestions.value = mockSuggestions
    .filter(suggestion => suggestion.includes(query))
    .slice(0, 5);
};

const applySuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  searchSuggestions.value = [];
  handleSearch();
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  isSearching.value = true;
  hasSearched.value = true;
  const startTime = Date.now();
  
  try {
    // 执行搜索
    const results = await itemService.searchItems('demo-user', searchQuery.value, filters.value);
    
    // 计算相似度分数（模拟）
    const resultsWithScore: SearchResultItem[] = results.map((item: Item) => ({
      ...item,
      similarity_score: calculateSimilarity(searchQuery.value, item.name),
    }));
    
    // 按相似度排序
    resultsWithScore.sort((a: SearchResultItem, b: SearchResultItem) => (b.similarity_score || 0) - (a.similarity_score || 0));
    
    searchResults.value = resultsWithScore;
    searchTime.value = Date.now() - startTime;
    
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const calculateSimilarity = (query: string, itemName: string): number => {
  // 简单的相似度计算（实际应该使用更复杂的算法）
  const queryLower = query.toLowerCase();
  const nameLower = itemName.toLowerCase();
  
  if (nameLower.includes(queryLower)) return 0.9;
  if (queryLower.includes(nameLower)) return 0.8;
  
  const commonWords = queryLower.split('').filter(char => nameLower.includes(char));
  return Math.min(commonWords.length / queryLower.length, 0.7);
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const applyFilters = () => {
  if (searchQuery.value.trim()) {
    handleSearch();
  }
  showFilters.value = false;
};

const clearFilters = () => {
  filters.value = {
    category_ids: [],
    condition: '',
    price_range: {
      min_price: 0,
      max_price: 0,
    },
    date_range: {
      start_date: '',
      end_date: '',
    },
  };
  if (searchQuery.value.trim()) {
    handleSearch();
  }
};

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((c: Category) => c.id === categoryId);
  return category?.name || '未分类';
};

const viewSimilarItems = (item: Item) => {
  console.log('查看相似物品:', item);
  // 跳转到相似物品页面或显示相似物品列表
};

// 初始化
onMounted(async () => {
  try {
    categories.value = await categoryService.getCategories();
  } catch (error) {
    console.error('加载分类失败:', error);
  }
});
</script>

<style scoped>
.search-page {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  text-align: center;
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

.search-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  padding-left: 2.5rem;
  padding-right: 8rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.search-btn {
  position: absolute;
  right: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #1d4ed8;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-suggestions {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.suggestions-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-item {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #e5e7eb;
}

.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-toggle {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.filter-toggle:hover {
  background-color: #f9fafb;
}

.filters-panel {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
}

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-input {
  accent-color: #2563eb;
}

.price-range,
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input,
.date-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
}

.price-input:focus,
.date-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.price-separator,
.date-separator {
  color: #6b7280;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.search-results {
  min-height: 400px;
}

.searching-state {
  text-align: center;
  padding: 3rem 0;
}

.searching-spinner {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem auto;
  border: 4px solid #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 9999px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.searching-text {
  color: #6b7280;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.results-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .results-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.result-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: box-shadow 0.2s;
}

.result-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.result-image {
  width: 100%;
  height: 8rem;
  margin-bottom: 0.75rem;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
}

.no-image {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.result-name {
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.similarity-score {
  padding: 0.125rem 0.5rem;
  background-color: #e0f2fe;
  color: #075985;
  font-size: 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
}

.result-description {
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.result-price {
  font-weight: 500;
  color: #16a34a;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 0.75rem;
  border-radius: 9999px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.no-results {
  text-align: center;
  padding: 3rem 0;
}

.no-results-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.no-results-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.suggestions-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.search-prompt {
  text-align: center;
  padding: 3rem 0;
}

.prompt-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.prompt-text {
  color: #6b7280;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-outline {
  border-color: #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}
</style>
