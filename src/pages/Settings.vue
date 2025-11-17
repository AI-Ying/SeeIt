<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">设置</h1>
      <p class="page-subtitle">管理您的应用偏好和账户设置</p>
    </div>

    <div class="settings-content">
      <!-- 通知设置 -->
      <div class="settings-section">
        <h2 class="section-title">通知设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">AI建议通知</h3>
              <p class="setting-description">接收AI消费建议和提醒</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.ai_notifications" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">重复购买提醒</h3>
              <p class="setting-description">当检测到相似物品时提醒您</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.duplicate_alerts" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">月度消费报告</h3>
              <p class="setting-description">每月接收消费分析报告</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.monthly_reports" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- AI设置 -->
      <div class="settings-section">
        <h2 class="section-title">AI设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">AI分类建议</h3>
              <p class="setting-description">自动为新物品推荐分类</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.ai_category_suggestions" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">相似物品检测</h3>
              <p class="setting-description">自动检测相似的已拥有物品</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.similarity_detection" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">智能搜索敏感度</h3>
              <p class="setting-description">调整相似物品搜索的严格程度</p>
            </div>
            <div class="slider-control">
              <input
                v-model.number="settings.search_sensitivity"
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                class="range-slider"
              />
              <span class="slider-value">{{ Math.round(settings.search_sensitivity * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="settings-section">
        <h2 class="section-title">隐私设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">数据同步</h3>
              <p class="setting-description">将数据同步到云端</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.data_sync" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">匿名使用数据</h3>
              <p class="setting-description">允许收集匿名使用数据以改进服务</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.analytics_enabled" type="checkbox" class="toggle-input" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">图片数据保留</h3>
              <p class="setting-description">物品图片的存储期限</p>
            </div>
            <select v-model="settings.image_retention" class="select-input">
              <option value="forever">永久保留</option>
              <option value="1year">1年</option>
              <option value="6months">6个月</option>
              <option value="3months">3个月</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 外观设置 -->
      <div class="settings-section">
        <h2 class="section-title">外观设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">主题模式</h3>
              <p class="setting-description">选择应用的主题外观</p>
            </div>
            <div class="theme-selector">
              <label class="theme-option">
                <input v-model="settings.theme" type="radio" value="light" class="radio-input" />
                <span class="theme-label">浅色</span>
              </label>
              <label class="theme-option">
                <input v-model="settings.theme" type="radio" value="dark" class="radio-input" />
                <span class="theme-label">深色</span>
              </label>
              <label class="theme-option">
                <input v-model="settings.theme" type="radio" value="auto" class="radio-input" />
                <span class="theme-label">跟随系统</span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">语言</h3>
              <p class="setting-description">应用界面语言</p>
            </div>
            <select v-model="settings.language" class="select-input">
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="settings-section">
        <h2 class="section-title">数据管理</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">导出数据</h3>
              <p class="setting-description">导出您的所有物品数据</p>
            </div>
            <button @click="exportData" class="btn btn-outline">
              导出
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">清理缓存</h3>
              <p class="setting-description">清理应用缓存数据</p>
            </div>
            <button @click="clearCache" class="btn btn-outline">
              清理
            </button>
          </div>
          
          <div class="setting-item danger">
            <div class="setting-info">
              <h3 class="setting-title danger-title">删除账户</h3>
              <p class="setting-description danger-description">永久删除您的账户和所有数据</p>
            </div>
            <button @click="deleteAccount" class="btn btn-danger">
              删除账户
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="settings-footer">
      <button @click="saveSettings" class="btn btn-primary" :disabled="isSaving">
        {{ isSaving ? '保存中...' : '保存设置' }}
      </button>
      <button @click="resetSettings" class="btn btn-secondary">
        重置为默认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 设置数据
const settings = ref({
  // 通知设置
  ai_notifications: true,
  duplicate_alerts: true,
  monthly_reports: true,
  
  // AI设置
  ai_category_suggestions: true,
  similarity_detection: true,
  search_sensitivity: 0.7,
  
  // 隐私设置
  data_sync: true,
  analytics_enabled: true,
  image_retention: 'forever',
  
  // 外观设置
  theme: 'light',
  language: 'zh-CN',
});

const isSaving = ref(false);

// 方法
const saveSettings = async () => {
  isSaving.value = true;
  try {
    // 模拟保存设置
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('seeit_settings', JSON.stringify(settings.value));
    alert('设置已保存');
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

const resetSettings = () => {
  if (confirm('确定要重置所有设置为默认值吗？')) {
    settings.value = {
      ai_notifications: true,
      duplicate_alerts: true,
      monthly_reports: true,
      ai_category_suggestions: true,
      similarity_detection: true,
      search_sensitivity: 0.7,
      data_sync: true,
      analytics_enabled: true,
      image_retention: 'forever',
      theme: 'light',
      language: 'zh-CN',
    };
  }
};

const exportData = () => {
  // 模拟数据导出
  const data = {
    settings: settings.value,
    exportDate: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seeit-settings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const clearCache = () => {
  if (confirm('确定要清理应用缓存吗？这将删除临时数据但不会删除您的物品信息。')) {
    // 清理本地存储的缓存数据
    const keysToKeep = ['seeit_settings', 'seeit_user'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    alert('缓存已清理');
  }
};

const deleteAccount = () => {
  if (confirm('警告：此操作将永久删除您的账户和所有数据，无法恢复。确定要继续吗？')) {
    if (prompt('请输入"DELETE"确认删除账户：') === 'DELETE') {
      // 模拟删除账户
      localStorage.clear();
      alert('账户已删除');
      // 跳转到登录页面或首页
      window.location.href = '/';
    }
  }
};

// 初始化
onMounted(() => {
  // 加载保存的设置
  const savedSettings = localStorage.getItem('seeit_settings');
  if (savedSettings) {
    try {
      settings.value = JSON.parse(savedSettings);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
});
</script>

<style scoped>
.settings-page {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.setting-item.danger {
  background-color: #fee2e2;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-weight: 500;
  color: #111827;
}

.setting-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.danger-title {
  color: #7f1d1d;
}

.danger-description {
  color: #b91c1c;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.3s;
}

.toggle-slider:before {
  content: '';
  position: absolute;
  height: 1rem;
  width: 1rem;
  left: 0.25rem;
  bottom: 0.25rem;
  background-color: #ffffff;
  border-radius: 9999px;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background-color: #2563eb;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-slider {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  appearance: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background-color: #2563eb;
  border-radius: 9999px;
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background-color: #2563eb;
  border-radius: 9999px;
  cursor: pointer;
  border: 0;
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  width: 3rem;
  text-align: right;
}

.select-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #ffffff;
  outline: none;
}

.select-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.theme-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-input {
  accent-color: #2563eb;
}

.theme-label {
  font-size: 0.875rem;
  color: #374151;
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

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
