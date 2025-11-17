<template>
  <div class="items-page">
    <div class="page-header">
      <h1 class="page-title">我的物品</h1>
      <div class="page-actions">
        <router-link to="/add" class="btn btn-primary">
          <PlusCircleIcon class="w-4 h-4 mr-2" />
          添加物品
        </router-link>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="search-box">
        <SearchIcon class="w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索物品..."
          class="search-input"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="selectedCategory" class="filter-select">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="created_at">最新添加</option>
          <option value="name">名称排序</option>
          <option value="purchase_date">购买日期</option>
          <option value="purchase_price">价格排序</option>
        </select>
      </div>
    </div>

    <!-- 物品列表 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>
    
    <div v-else-if="filteredItems.length > 0" class="items-grid">
      <div v-for="item in filteredItems" :key="item.id" class="item-card">
        <div class="item-image">
          <img v-if="item.image_urls?.[0]" :src="item.image_urls[0]" :alt="item.name" />
          <div v-else class="no-image">
            <PackageIcon class="w-12 h-12 text-gray-400" />
          </div>
        </div>
        
        <div class="item-content">
          <div class="item-header">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-condition">
              <span :class="getConditionBadgeClass(item.condition)">
                {{ getConditionText(item.condition) }}
              </span>
            </div>
          </div>
          
          <p class="item-description">{{ item.description || '暂无描述' }}</p>
          
          <div class="item-meta">
            <div class="meta-item">
              <TagIcon class="w-4 h-4 text-gray-400" />
              <span>{{ getCategoryName(item.category_id) }}</span>
            </div>
            <div v-if="item.purchase_price" class="meta-item">
              <span class="item-price">¥{{ item.purchase_price }}</span>
            </div>
          </div>
          
          <div class="item-tags" v-if="item.tags?.length">
            <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="item-actions">
          <router-link :to="`/item/${item.id}`" class="btn btn-sm btn-outline">
            查看详情
          </router-link>
          <button @click="handleDelete(item)" class="btn btn-sm btn-danger">
            删除
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <PackageIcon class="w-16 h-16 text-gray-300 mb-4" />
      <p class="empty-text">暂无物品</p>
      <router-link to="/add" class="btn btn-primary">
        添加第一个物品
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  PlusCircleIcon, 
  SearchIcon, 
  PackageIcon, 
  TagIcon 
} from 'lucide-vue-next';
import { itemService, categoryService } from '@/composables/useSupabase';
import type { Item, Category } from '@/types';

// 数据
const items = ref<Item[]>([]);
const categories = ref<Category[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('created_at');
const loading = ref(true);

// 计算属性
const filteredItems = computed(() => {
  let result = items.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item: Item) => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }
  
  // 分类过滤
  if (selectedCategory.value) {
    result = result.filter((item: Item) => item.category_id === selectedCategory.value);
  }
  
  // 排序
  result.sort((a: Item, b: Item) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'purchase_date':
        return (b.purchase_date || '').localeCompare(a.purchase_date || '');
      case 'purchase_price':
        return (b.purchase_price || 0) - (a.purchase_price || 0);
      default:
        return (b.created_at || '').localeCompare(a.created_at || '');
    }
  });
  
  return result;
});

// 方法
const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((c: Category) => c.id === categoryId);
  return category?.name || '未分类';
};

const getConditionText = (condition: string): string => {
  const conditionMap = {
    new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
    poor: '较差',
  };
  return conditionMap[condition as keyof typeof conditionMap] || condition;
};

const getConditionBadgeClass = (condition: string): string => {
  const classMap = {
    new: 'badge-success',
    like_new: 'badge-primary',
    good: 'badge-warning',
    fair: 'badge-secondary',
    poor: 'badge-error',
  };
  return classMap[condition as keyof typeof classMap] || 'badge-secondary';
};

const handleDelete = async (item: Item) => {
  if (confirm(`确定要删除 "${item.name}" 吗？`)) {
    try {
      await itemService.deleteItem(item.id);
      // 从列表中移除
      const index = items.value.findIndex((i: Item) => i.id === item.id);
      if (index > -1) {
        items.value.splice(index, 1);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }
};

// 初始化
onMounted(async () => {
  try {
    const [itemsData, categoriesData] = await Promise.all([
      itemService.getUserItems('demo-user', 1, 50),
      categoryService.getCategories(),
    ]);
    
    items.value = itemsData.items;
    categories.value = categoriesData;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.items-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 640px) {
  .filter-section {
    flex-direction: row;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 28rem;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
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

.loading-text {
  color: #6b7280;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .items-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.item-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.item-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.item-image {
  width: 100%;
  height: 12rem;
  background-color: #f3f4f6;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.item-name {
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.item-condition {
  flex-shrink: 0;
}

.item-description {
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.item-price {
  font-weight: 500;
  color: #16a34a;
}

.item-tags {
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

.item-actions {
  padding: 1rem;
  padding-top: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}
</style>
