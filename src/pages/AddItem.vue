<template>
  <div class="add-item-page">
    <div class="page-header">
      <h1 class="page-title">添加新物品</h1>
      <p class="page-subtitle">拍照上传您的物品，AI将自动推荐分类</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="add-item-form">
        <!-- 图片上传区域 -->
        <div class="form-section">
          <h2 class="section-title">物品图片</h2>
          <FileUpload
            ref="fileUploadRef"
            @files-selected="handleFilesSelected"
            @upload-start="handleUploadStart"
            @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError"
          />
        </div>

        <!-- 基本信息 -->
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="name" class="form-label">物品名称 *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-input"
                placeholder="请输入物品名称"
                required
                @blur="suggestCategory"
              />
            </div>

            <div class="form-group">
              <label for="brand" class="form-label">品牌</label>
              <input
                id="brand"
                v-model="form.brand"
                type="text"
                class="form-input"
                placeholder="请输入品牌名称"
              />
            </div>

            <div class="form-group">
              <label for="model" class="form-label">型号</label>
              <input
                id="model"
                v-model="form.model"
                type="text"
                class="form-input"
                placeholder="请输入型号"
              />
            </div>

            <div class="form-group">
              <label for="condition" class="form-label">物品状态</label>
              <select id="condition" v-model="form.condition" class="form-select">
                <option value="new">全新</option>
                <option value="like_new">几乎全新</option>
                <option value="good">良好</option>
                <option value="fair">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">描述</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="form-textarea"
              placeholder="请输入物品描述，有助于AI更好地分类"
              @blur="suggestCategory"
            ></textarea>
          </div>
        </div>

        <!-- 分类信息 -->
        <div class="form-section">
          <h2 class="section-title">分类信息</h2>
          
          <!-- AI分类建议 -->
          <div v-if="aiSuggestion" class="ai-suggestion">
            <div class="suggestion-header">
              <span class="suggestion-title">💡 AI分类建议</span>
              <span class="confidence-badge" :class="getConfidenceClass(aiSuggestion.confidence)">
                {{ Math.round(aiSuggestion.confidence * 100) }}% 置信度
              </span>
            </div>
            <div class="suggestion-content">
              <p class="suggested-category">{{ aiSuggestion.category_name }}</p>
              <div class="suggestion-reasons">
                <span v-for="reason in aiSuggestion.reasons" :key="reason" class="reason-tag">
                  {{ reason }}
                </span>
              </div>
              <div class="suggestion-actions">
                <button
                  type="button"
                  @click="applyAICategory"
                  class="apply-suggestion-btn"
                >
                  应用此分类
                </button>
                <button
                  type="button"
                  @click="dismissAICategory"
                  class="dismiss-suggestion-btn"
                >
                  忽略建议
                </button>
              </div>
            </div>
          </div>

          <!-- 分类选择区域 -->
          <div class="category-selection">
            <div class="form-group">
              <label class="form-label">主分类 *</label>
              
              <!-- 分类网格 -->
              <div class="category-grid">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="category-card"
                  :class="{ 'selected': form.category_id === category.id }"
                  @click="selectCategory(category.id)"
                >
                  <div class="category-icon">{{ category.icon || '📦' }}</div>
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-description">{{ category.description }}</div>
                </div>
              </div>
              
              <!-- 传统下拉选择作为备选 -->
              <select
                id="category"
                v-model="form.category_id"
                class="form-select mobile-category-select"
                required
                @change="handleCategoryChange"
              >
                <option value="">请选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div v-if="subcategories.length > 0" class="form-group">
              <label for="subcategory" class="form-label">子分类</label>
              <div class="subcategory-list">
                <button
                  v-for="sub in subcategories"
                  :key="sub.id"
                  type="button"
                  class="subcategory-btn"
                  :class="{ 'selected': form.subcategory_id === sub.id }"
                  @click="selectSubcategory(sub.id)"
                >
                  {{ sub.name }}
                </button>
              </div>
              
              <!-- 传统下拉选择作为备选 -->
              <select
                id="subcategory"
                v-model="form.subcategory_id"
                class="form-select mobile-subcategory-select"
                :disabled="!subcategories.length"
              >
                <option value="">请选择子分类</option>
                <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>
          
          <!-- 手动分类提示 -->
          <div v-if="!aiSuggestion && !form.category_id" class="manual-category-tip">
            <p>💡 您可以输入物品名称和描述，让AI为您推荐合适的分类</p>
          </div>
        </div>

        <!-- 购买信息 -->
        <div class="form-section">
          <h2 class="section-title">购买信息</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="purchase_date" class="form-label">购买日期</label>
              <input
                id="purchase_date"
                v-model="form.purchase_date"
                type="date"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="purchase_price" class="form-label">购买价格 (¥)</label>
              <input
                id="purchase_price"
                v-model.number="form.purchase_price"
                type="number"
                step="0.01"
                class="form-input"
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label for="purchase_location" class="form-label">购买地点</label>
              <input
                id="purchase_location"
                v-model="form.purchase_location"
                type="text"
                class="form-input"
                placeholder="请输入购买地点"
              />
            </div>

            <div class="form-group">
              <label for="quantity" class="form-label">数量</label>
              <input
                id="quantity"
                v-model.number="form.quantity"
                type="number"
                min="1"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="form-section">
          <h2 class="section-title">其他信息</h2>
          
          <div class="form-group">
            <label for="tags" class="form-label">标签</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="tag in form.tags" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)" class="tag-remove">
                    ×
                  </button>
                </span>
                <input
                  type="text"
                  v-model="tagInput"
                  @keydown.enter.prevent="addTag"
                  @keydown.tab.prevent="addTag"
                  placeholder="输入标签后按回车"
                  class="tag-input-field"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="notes" class="form-label">备注</label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="form-textarea"
              placeholder="请输入备注信息"
            ></textarea>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-secondary"
            :disabled="isSubmitting"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? '保存中...' : '保存物品' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FileUpload from '@/components/FileUpload.vue';
import { itemService, categoryService, uploadService } from '@/composables/useSupabase';
import { simpleUploadService } from '@/composables/useSimpleUpload';
import { useAuth } from '@/composables/useAuth';
import type { Category, Subcategory, AICategorySuggestion } from '@/types';

const router = useRouter();
const fileUploadRef = ref<InstanceType<typeof FileUpload>>();
const { userId } = useAuth();

// 表单数据
const form = ref({
  name: '',
  description: '',
  brand: '',
  model: '',
  condition: 'good' as const,
  category_id: '',
  subcategory_id: '',
  purchase_date: '',
  purchase_price: undefined as number | undefined,
  purchase_location: '',
  quantity: 1,
  tags: [] as string[],
  notes: '',
  image_urls: [] as string[],
});

const tagInput = ref('');
const isSubmitting = ref(false);
const isUploading = ref(false);
const categories = ref<Category[]>([]);
const subcategories = ref<Subcategory[]>([]);
const aiSuggestion = ref<AICategorySuggestion | null>(null);

// 计算属性
const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.category_id;
});

// 方法
const handleFilesSelected = (files: File[]) => {
  console.log('选中文件:', files);
  // 这里可以添加文件选择后的处理逻辑
};

const handleUploadStart = () => {
  console.log('开始上传图片');
  isUploading.value = true;
};

const handleUploadSuccess = (urls: string[]) => {
  console.log('图片上传成功，URLs:', urls);
  form.value.image_urls = urls;
  isUploading.value = false;
  
  // 图片上传成功后重新触发AI分类建议
  if (form.value.name || form.value.description) {
    suggestCategory();
  }
};

const handleUploadError = (error: string) => {
  console.error('上传错误:', error);
  isUploading.value = false;
  alert(`图片上传失败: ${error}`);
};

const suggestCategory = async () => {
  if (!form.value.name && !form.value.description) return;
  
  try {
    const suggestion = await categoryService.getAICategorySuggestion({
      name: form.value.name,
      description: form.value.description,
      image_urls: form.value.image_urls,
      userId: userId.value
    });
    
    aiSuggestion.value = suggestion;
  } catch (error) {
    console.error('AI分类建议失败:', error);
  }
};

const applyAICategory = () => {
  if (aiSuggestion.value) {
    form.value.category_id = aiSuggestion.value.category_id;
    handleCategoryChange();
  }
};

const dismissAICategory = () => {
  aiSuggestion.value = null;
};

const selectCategory = (categoryId: string) => {
  form.value.category_id = categoryId;
  handleCategoryChange();
};

const selectSubcategory = (subcategoryId: string) => {
  form.value.subcategory_id = subcategoryId;
};

const getConfidenceClass = (confidence: number): string => {
  if (confidence >= 0.8) return 'confidence-high';
  if (confidence >= 0.6) return 'confidence-medium';
  return 'confidence-low';
};

const handleCategoryChange = async () => {
  if (!form.value.category_id) {
    subcategories.value = [];
    return;
  }
  
  try {
    subcategories.value = await categoryService.getSubcategories(form.value.category_id);
    form.value.subcategory_id = '';
  } catch (error) {
    console.error('获取子分类失败:', error);
    subcategories.value = [];
  }
};

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
    tagInput.value = '';
  }
};

const removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag);
  if (index > -1) {
    form.value.tags.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    console.log('表单验证失败:', { name: form.value.name, category_id: form.value.category_id });
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    console.log('开始保存物品，用户ID:', userId.value);
    
    // 获取上传的图片
    const files = fileUploadRef.value?.getFiles() || [];
    console.log('待上传图片数量:', files.length);
    
    // 上传图片
    let imageUrls: string[] = [];
    if (files.length > 0) {
      try {
        console.log('开始上传图片到Supabase...');
        // 使用简化上传服务进行测试
        const uploadPromises = files.map(file => simpleUploadService.uploadFile(file, userId.value));
        imageUrls = await Promise.all(uploadPromises);
        console.log('图片上传成功，URLs:', imageUrls);
        form.value.image_urls = imageUrls;
      } catch (uploadError: any) {
        console.error('图片上传失败:', uploadError);
        throw new Error(`图片上传失败: ${uploadError.message || '请检查图片格式和大小'}`);
      }
    } else {
      console.log('没有图片需要上传');
    }
    
    // 创建物品 - 清理数据，确保只提交必要的字段
    const itemData = {
      user_id: userId.value,
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      brand: form.value.brand?.trim() || undefined,
      model: form.value.model?.trim() || undefined,
      condition: form.value.condition,
      category_id: form.value.category_id || undefined,
      subcategory_id: form.value.subcategory_id || undefined,
      purchase_date: form.value.purchase_date || undefined,
      purchase_price: form.value.purchase_price || undefined,
      purchase_location: form.value.purchase_location?.trim() || undefined,
      quantity: form.value.quantity || 1,
      tags: form.value.tags.length > 0 ? form.value.tags : undefined,
      notes: form.value.notes?.trim() || undefined,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      ai_suggested_category_id: aiSuggestion.value?.category_id || undefined,
      ai_confidence: aiSuggestion.value?.confidence || undefined,
    };
    
    console.log('准备创建物品，数据:', itemData);
    
    const createdItem = await itemService.createItem(itemData);
    console.log('物品创建成功:', createdItem);
    
    // 成功提示和跳转
    alert('物品添加成功！');
    router.push('/items');
    
  } catch (error: any) {
    console.error('保存物品失败:', error);
    let errorMessage = '保存失败，请重试';
    
    // 提供更详细的错误信息
    if (error?.message) {
      if (error.message.includes('unique')) {
        errorMessage = '物品已存在，请勿重复添加';
      } else if (error.message.includes('foreign key')) {
        errorMessage = '分类信息错误，请重新选择分类';
      } else if (error.message.includes('permission')) {
        errorMessage = '权限不足，无法保存物品';
      } else {
        errorMessage = `保存失败: ${error.message}`;
      }
    }
    
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (confirm('确定要取消吗？已填写的信息将不会保存。')) {
    router.back();
  }
};

// 初始化
onMounted(async () => {
  try {
    categories.value = await categoryService.getCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
  }
});
</script>

<style scoped>
/* AddItem页面样式 */

.add-item-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.form-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* AI分类建议样式 */
.ai-suggestion {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.suggestion-title {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 1.1rem;
}

.confidence-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.confidence-high {
  background-color: #dcfce7;
  color: #166534;
}

.confidence-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.confidence-low {
  background-color: #fee2e2;
  color: #991b1b;
}

.suggested-category {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.75rem;
}

.suggestion-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reason-tag {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.suggestion-actions {
  display: flex;
  gap: 1rem;
}

.apply-suggestion-btn {
  background-color: #0ea5e9;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-suggestion-btn:hover {
  background-color: #0284c7;
}

.dismiss-suggestion-btn {
  background-color: transparent;
  color: #6b7280;
  padding: 0.5rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-suggestion-btn:hover {
  background-color: #f9fafb;
  color: #374151;
}

/* 分类选择样式 */
.category-selection {
  margin-bottom: 1rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.category-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.category-card.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.category-card.selected::before {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #3b82f6;
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.category-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.mobile-category-select {
  display: none;
}

.subcategory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.subcategory-btn {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.subcategory-btn:hover {
  background-color: #e5e7eb;
}

.subcategory-btn.selected {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.mobile-subcategory-select {
  display: none;
}

.manual-category-tip {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.manual-category-tip p {
  color: #0c4a6e;
  margin: 0;
  font-size: 0.875rem;
}

/* 标签输入样式 */
.tags-input {
  position: relative;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  min-height: 3rem;
  align-items: center;
}

.tag-item {
  background-color: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input-field {
  border: none;
  outline: none;
  flex: 1;
  min-width: 8rem;
  font-size: 1rem;
}

/* 表单操作样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-item-page {
    padding: 1rem 0.5rem;
  }
  
  .form-container {
    padding: 1.5rem 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .category-grid {
    display: none;
  }
  
  .mobile-category-select {
    display: block;
  }
  
  .subcategory-list {
    display: none;
  }
  
  .mobile-subcategory-select {
    display: block;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .suggestion-actions {
    flex-direction: column;
  }
  
  .ai-suggestion {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 1rem;
  }
  
  .form-section {
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .category-card {
    padding: 1rem 0.5rem;
  }
  
  .category-icon {
    font-size: 1.5rem;
  }
  
  .category-name {
    font-size: 0.875rem;
  }
  
  .category-description {
    font-size: 0.75rem;
  }
}

/* 加载状态 */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* 错误状态 */
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 成功提示 */
.success-message {
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>