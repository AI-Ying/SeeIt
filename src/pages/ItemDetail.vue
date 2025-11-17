<template>
  <div class="item-detail-page">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <ArrowLeftIcon class="w-5 h-5 mr-2" />
        返回
      </button>
      <div class="header-actions">
        <button @click="editItem" class="btn btn-outline">
          <EditIcon class="w-4 h-4 mr-2" />
          编辑
        </button>
        <button @click="deleteItem" class="btn btn-danger">
          <TrashIcon class="w-4 h-4 mr-2" />
          删除
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <div v-else-if="item" class="item-content">
      <!-- 图片展示 -->
      <div class="image-section">
        <div v-if="item.image_urls && item.image_urls.length > 0" class="image-gallery">
          <div class="main-image">
            <img :src="item.image_urls[currentImageIndex]" :alt="item.name" />
          </div>
          <div v-if="item.image_urls.length > 1" class="thumbnail-list">
            <div
              v-for="(url, index) in item.image_urls"
              :key="index"
              @click="currentImageIndex = index"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
            >
              <img :src="url" :alt="item.name + ' ' + (index + 1)" />
            </div>
          </div>
        </div>
        <div v-else class="no-image">
          <PackageIcon class="w-24 h-24 text-gray-300" />
          <p class="no-image-text">暂无图片</p>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <div class="info-header">
          <h1 class="item-name">{{ item.name }}</h1>
          <div class="item-condition">
            <span :class="getConditionBadgeClass(item.condition)">
              {{ getConditionText(item.condition) }}
            </span>
          </div>
        </div>

        <div v-if="item.description" class="item-description">
          <p>{{ item.description }}</p>
        </div>

        <!-- 详细信息 -->
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">分类</span>
            <span class="detail-value">{{ getCategoryName(item.category_id) }}</span>
          </div>
          
          <div v-if="item.subcategory_id" class="detail-item">
            <span class="detail-label">子分类</span>
            <span class="detail-value">{{ getSubcategoryName(item.subcategory_id) }}</span>
          </div>
          
          <div v-if="item.brand" class="detail-item">
            <span class="detail-label">品牌</span>
            <span class="detail-value">{{ item.brand }}</span>
          </div>
          
          <div v-if="item.model" class="detail-item">
            <span class="detail-label">型号</span>
            <span class="detail-value">{{ item.model }}</span>
          </div>
          
          <div v-if="item.purchase_date" class="detail-item">
            <span class="detail-label">购买日期</span>
            <span class="detail-value">{{ formatDate(item.purchase_date) }}</span>
          </div>
          
          <div v-if="item.purchase_price" class="detail-item">
            <span class="detail-label">购买价格</span>
            <span class="detail-value">¥{{ item.purchase_price }}</span>
          </div>
          
          <div v-if="item.purchase_location" class="detail-item">
            <span class="detail-label">购买地点</span>
            <span class="detail-value">{{ item.purchase_location }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">数量</span>
            <span class="detail-value">{{ item.quantity }}</span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="item.tags && item.tags.length > 0" class="tags-section">
          <h3 class="section-subtitle">标签</h3>
          <div class="tags-list">
            <span v-for="tag in item.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 备注 -->
        <div v-if="item.notes" class="notes-section">
          <h3 class="section-subtitle">备注</h3>
          <p class="notes-content">{{ item.notes }}</p>
        </div>

        <!-- AI分类建议 -->
        <div v-if="item.ai_suggested_category_id" class="ai-suggestion-section">
          <h3 class="section-subtitle">AI分类建议</h3>
          <div class="ai-suggestion">
            <div class="suggestion-content">
              <p class="suggested-category">
                建议分类：{{ getCategoryName(item.ai_suggested_category_id) }}
              </p>
              <p class="confidence">
                置信度：{{ Math.round((item.ai_confidence || 0) * 100) }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 相似物品 -->
      <div v-if="similarItems.length > 0" class="similar-section">
        <h2 class="section-title">相似物品</h2>
        <div class="similar-items-grid">
          <div v-for="similarItem in similarItems" :key="similarItem.id" class="similar-item-card">
            <div class="similar-item-image">
              <img v-if="similarItem.image_urls?.[0]" :src="similarItem.image_urls[0]" :alt="similarItem.name" />
              <div v-else class="no-image-small">
                <PackageIcon class="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div class="similar-item-info">
              <h4 class="similar-item-name">{{ similarItem.name }}</h4>
              <p class="similar-item-category">{{ getCategoryName(similarItem.category_id) }}</p>
            </div>
            <router-link :to="`/item/${similarItem.id}`" class="similar-item-link">
              查看详情
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <PackageIcon class="w-16 h-16 text-gray-300 mb-4" />
      <h3 class="empty-title">物品不存在</h3>
      <p class="empty-text">该物品可能已被删除或不存在</p>
      <button @click="goBack" class="btn btn-primary">
        返回物品列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  PackageIcon,
} from 'lucide-vue-next';
import { itemService, categoryService } from '@/composables/useSupabase';
import type { Item, Category, Subcategory } from '@/types';
import { formatDate } from '@/utils/helpers';

const route = useRoute();
const router = useRouter();

// 数据
const item = ref<Item | null>(null);
const categories = ref<Category[]>([]);
const subcategories = ref<Subcategory[]>([]);
const similarItems = ref<Item[]>([]);
const loading = ref(true);
const currentImageIndex = ref(0);

// 方法
const goBack = () => {
  router.back();
};

const editItem = () => {
  // 实现编辑功能
  console.log('编辑物品:', item.value?.id);
};

const deleteItem = async () => {
  if (!item.value) return;
  
  if (confirm(`确定要删除 "${item.value.name}" 吗？此操作无法撤销。`)) {
    try {
      await itemService.deleteItem(item.value.id);
      alert('物品已删除');
      router.push('/items');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  }
};

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find((c: Category) => c.id === categoryId);
  return category?.name || '未分类';
};

const getSubcategoryName = (subcategoryId: string): string => {
  const subcategory = subcategories.value.find((s: Subcategory) => s.id === subcategoryId);
  return subcategory?.name || '';
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

// 初始化
onMounted(async () => {
  try {
    const itemId = route.params.id as string;
    
    // 并行加载数据
    const [itemData, categoriesData] = await Promise.all([
      itemService.getUserItems('demo-user', 1, 100), // 临时方案，应该提供单独的获取方法
      categoryService.getCategories(),
    ]);
    
    // 找到对应的物品
    const foundItem = itemData.items.find((i: Item) => i.id === itemId);
    if (foundItem) {
      item.value = foundItem;
      
      // 加载相似物品
      similarItems.value = await itemService.getSimilarItems(foundItem.id, 3);
      
      // 加载子分类
      if (foundItem.category_id) {
        subcategories.value = await categoryService.getSubcategories(foundItem.category_id);
      }
    }
    
    categories.value = categoriesData;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.item-detail-page {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #6b7280;
  border-radius: 0.5rem;
  transition: color 0.2s, background-color 0.2s;
}

.back-btn:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.item-content {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;
}

@media (min-width: 1024px) {
  .item-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.image-section,
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  height: 24rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f3f4f6;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.thumbnail {
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f3f4f6;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: #0ea5e9;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 24rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-image-text {
  color: #6b7280;
  margin-top: 0.5rem;
}

.no-image-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.item-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.item-condition {
  flex-shrink: 0;
}

.item-description {
  color: #6b7280;
  line-height: 1.625;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #111827;
}

.section-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.notes-content {
  color: #6b7280;
  line-height: 1.625;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.ai-suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ai-suggestion {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
}

.suggested-category {
  font-weight: 500;
  color: #1e3a8a;
}

.confidence {
  font-size: 0.875rem;
  color: #1d4ed8;
  margin-top: 0.25rem;
}

.similar-section {
  width: 100%;
}

@media (min-width: 1024px) {
  .similar-section {
    grid-column: span 2 / span 2;
  }
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.similar-items-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

@media (min-width: 640px) {
  .similar-items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .similar-items-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.similar-item-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.similar-item-image {
  width: 100%;
  height: 8rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f3f4f6;
}

.similar-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.similar-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.similar-item-name {
  font-weight: 500;
  color: #111827;
}

.similar-item-category {
  font-size: 0.875rem;
  color: #6b7280;
}

.similar-item-link {
  display: inline-block;
  font-size: 0.875rem;
  color: #0284c7;
}

.similar-item-link:hover {
  color: #0369a1;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 1rem;
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

.btn-outline {
  border-color: #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-primary {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.badge-error {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
