<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <div v-if="!isUploading" class="upload-content">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="upload-text">
          <p class="text-lg font-medium text-gray-700">
            {{ uploadText }}
          </p>
          <p class="text-sm text-gray-500">
            支持 JPEG、PNG、WebP 格式，最大 10MB
          </p>
        </div>
      </div>
      
      <div v-else class="upload-progress">
        <div class="spinner"></div>
        <p class="text-sm text-gray-600">{{ progressText }}</p>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 预览区域 -->
    <div v-if="previewImages.length > 0" class="preview-area">
      <div class="preview-grid">
        <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
          <img :src="image.url" :alt="image.name" class="preview-image" />
          <button
            @click="removeImage(index)"
            class="remove-btn"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="image-info">
            <p class="text-xs text-gray-600 truncate">{{ image.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(image.size) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { validateFile } from '@/utils/helpers';

interface PreviewImage {
  url: string;
  name: string;
  size: number;
  file: File;
}

interface Props {
  maxFiles?: number;
  maxSize?: number;
}

interface Emits {
  (e: 'files-selected', files: File[]): void;
  (e: 'upload-start'): void;
  (e: 'upload-success', urls: string[]): void;
  (e: 'upload-error', error: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 10,
  maxSize: 10 * 1024 * 1024, // 10MB
});

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);
const isUploading = ref(false);
const previewImages = ref<PreviewImage[]>([]);
const error = ref('');
const uploadProgress = ref(0);

const uploadText = computed(() => {
  if (previewImages.value.length === 0) {
    return '拖拽图片到此处或点击上传';
  }
  return '继续添加图片';
});

const progressText = computed(() => {
  return `上传中... ${uploadProgress.value}%`;
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  
  const files = Array.from(e.dataTransfer?.files || []);
  processFiles(files);
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  processFiles(files);
};

const processFiles = (files: File[]) => {
  error.value = '';
  
  console.log('处理文件:', files);
  
  // 过滤图片文件
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    error.value = '请选择图片文件';
    console.warn('没有有效的图片文件');
    return;
  }
  
  // 检查文件数量
  if (previewImages.value.length + imageFiles.length > props.maxFiles) {
    error.value = `最多只能上传 ${props.maxFiles} 张图片`;
    console.warn('文件数量超出限制');
    return;
  }
  
  // 验证每个文件
  for (const file of imageFiles) {
    const validation = validateFile(file);
    if (!validation.valid) {
      error.value = validation.error || '文件验证失败';
      console.warn('文件验证失败:', validation.error);
      return;
    }
  }
  
  console.log(`验证通过 ${imageFiles.length} 个文件，开始添加到预览`);
  
  // 添加到预览
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      previewImages.value.push({
        url,
        name: file.name,
        size: file.size,
        file,
      });
    };
    reader.onerror = () => {
      error.value = '读取文件失败';
      console.error('FileReader 读取文件失败:', file.name);
    };
    reader.readAsDataURL(file);
  });
  
  // 触发文件选择事件
  emit('files-selected', imageFiles);
  console.log('文件选择事件已触发');
};

const removeImage = (index: number) => {
  previewImages.value.splice(index, 1);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 暴露方法给父组件
const getFiles = (): File[] => {
  return previewImages.value.map(img => img.file);
};

const clearFiles = () => {
  previewImages.value = [];
  error.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

defineExpose({
  getFiles,
  clearFiles,
});
</script>

<style scoped>
.file-upload {
  margin-bottom: 1rem;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #60a5fa;
  background-color: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.75;
}

.upload-content {
  margin-bottom: 1rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
  color: #9ca3af;
}

.upload-text {
  margin-bottom: 0.5rem;
}

.upload-progress {
  margin-bottom: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  margin: 0 auto;
  border: 4px solid #dbeafe;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-area {
  margin-top: 1.5rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .preview-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.preview-item {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 8rem;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem;
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.image-info {
  margin-top: 0.5rem;
}

.error-message {
  margin-top: 0.5rem;
}
</style>