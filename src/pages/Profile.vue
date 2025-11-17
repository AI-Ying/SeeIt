<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人资料</h1>
    </div>

    <div class="profile-content">
      <!-- 基本信息 -->
      <div class="profile-section">
        <h2 class="section-title">基本信息</h2>
        <div class="profile-form">
          <div class="form-group">
            <label class="form-label">头像</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.username" />
                <div v-else class="avatar-placeholder">
                  <UserIcon class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <button class="btn btn-outline">更换头像</button>
            </div>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input v-model="user.username" type="text" class="form-input" />
            </div>
            
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input v-model="user.email" type="email" class="form-input" disabled />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea v-model="user.bio" rows="3" class="form-textarea" placeholder="介绍一下自己..."></textarea>
          </div>
          
          <div class="form-actions">
            <button @click="saveProfile" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="profile-section">
        <h2 class="section-title">统计信息</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <PackageIcon class="w-8 h-8 text-blue-600" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalItems }}</div>
              <div class="stat-label">总物品数</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <DollarSignIcon class="w-8 h-8 text-green-600" />
            </div>
            <div class="stat-content">
              <div class="stat-number">¥{{ stats.totalSpent }}</div>
              <div class="stat-label">总消费</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <CalendarIcon class="w-8 h-8 text-purple-600" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.memberDays }}</div>
              <div class="stat-label">使用天数</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <TrendingUpIcon class="w-8 h-8 text-orange-600" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgMonthlySpent }}</div>
              <div class="stat-label">月均消费</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消费偏好 -->
      <div class="profile-section">
        <h2 class="section-title">消费偏好</h2>
        <div class="preferences-grid">
          <div class="preference-card">
            <h3 class="preference-title">最常购买分类</h3>
            <div class="top-categories">
              <div v-for="(category, index) in topCategories" :key="category.id" 
                   class="category-item">
                <span class="category-rank">#{{ index + 1 }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}件</span>
              </div>
            </div>
          </div>
          
          <div class="preference-card">
            <h3 class="preference-title">价格偏好</h3>
            <div class="price-preferences">
              <div class="price-range">
                <span class="range-label">低价区间</span>
                <span class="range-value">{{ priceRanges.low }}%</span>
              </div>
              <div class="price-range">
                <span class="range-label">中价区间</span>
                <span class="range-value">{{ priceRanges.medium }}%</span>
              </div>
              <div class="price-range">
                <span class="range-label">高价区间</span>
                <span class="range-value">{{ priceRanges.high }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户设置 -->
      <div class="profile-section">
        <h2 class="section-title">账户设置</h2>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">修改密码</h3>
              <p class="setting-description">更新您的登录密码</p>
            </div>
            <button @click="showPasswordModal = true" class="btn btn-outline">
              修改
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">隐私设置</h3>
              <p class="setting-description">管理您的隐私偏好</p>
            </div>
            <router-link to="/settings" class="btn btn-outline">
              设置
            </router-link>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">数据导出</h3>
              <p class="setting-description">导出您的物品数据</p>
            </div>
            <button @click="exportData" class="btn btn-outline">
              导出
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 密码修改模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">修改密码</h3>
          <button @click="showPasswordModal = false" class="modal-close">
            ×
          </button>
        </div>
        
        <form @submit.prevent="changePassword" class="modal-form">
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <input v-model="passwordForm.currentPassword" type="password" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input v-model="passwordForm.newPassword" type="password" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" class="form-input" required />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showPasswordModal = false" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isChangingPassword">
              {{ isChangingPassword ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  UserIcon,
  PackageIcon,
  DollarSignIcon,
  CalendarIcon,
  TrendingUpIcon,
} from 'lucide-vue-next';

// 用户数据
const user = ref({
  id: 'demo-user',
  username: 'Demo用户',
  email: 'demo@example.com',
  avatar_url: '',
  bio: '热爱生活，理性消费',
  created_at: '2024-01-01T00:00:00Z',
});

// 统计数据
const stats = ref({
  totalItems: 42,
  totalSpent: '12,580',
  memberDays: 320,
  avgMonthlySpent: '1,048',
});

// 消费偏好
const topCategories = ref([
  { id: '1', name: '电子产品', count: 15 },
  { id: '2', name: '服装配饰', count: 12 },
  { id: '3', name: '生活用品', count: 8 },
]);

const priceRanges = ref({
  low: 45,    // < ¥100
  medium: 35, // ¥100-500
  high: 20,   // > ¥500
});

// 状态
const isSaving = ref(false);
const showPasswordModal = ref(false);
const isChangingPassword = ref(false);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 方法
const saveProfile = async () => {
  isSaving.value = true;
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('个人资料已保存');
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('新密码与确认密码不一致');
    return;
  }
  
  isChangingPassword.value = true;
  try {
    // 模拟修改密码
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('密码修改成功');
    showPasswordModal.value = false;
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error) {
    console.error('密码修改失败:', error);
    alert('密码修改失败，请重试');
  } finally {
    isChangingPassword.value = false;
  }
};

const exportData = () => {
  // 模拟数据导出
  const data = {
    user: user.value,
    stats: stats.value,
    exportDate: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seeit-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 初始化
onMounted(() => {
  // 这里可以加载实际的用户数据
});
</script>

<style scoped>
.profile-page {
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
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

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  overflow: hidden;
  background-color: #f3f4f6;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .preferences-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.preference-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.preference-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.top-categories {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.category-rank {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  width: 2rem;
}

.category-name {
  flex: 1;
  font-weight: 500;
  color: #111827;
}

.category-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-preferences {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-range {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.range-label {
  font-weight: 500;
  color: #111827;
}

.range-value {
  font-size: 0.875rem;
  color: #6b7280;
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
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  color: #9ca3af;
  font-size: 1.5rem;
}

.modal-close:hover {
  color: #6b7280;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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
