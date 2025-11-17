<template>
  <div class="app-layout">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <router-link to="/" class="logo">
            <span class="logo-text">SeeIt</span>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="main-nav">
          <router-link to="/" class="nav-link">
            <span>首页</span>
          </router-link>
          <router-link to="/items" class="nav-link">
            <span>我的物品</span>
          </router-link>
          <router-link to="/add" class="nav-link">
            <span>添加物品</span>
          </router-link>
          <router-link to="/search" class="nav-link">
            <span>智能搜索</span>
          </router-link>
          <router-link to="/insights" class="nav-link">
            <span>AI建议</span>
          </router-link>
        </nav>

        <!-- 用户菜单 -->
        <div class="user-section">
          <button @click="toggleUserMenu" class="user-menu-trigger">
            <span class="user-name">用户</span>
            <span class="dropdown-arrow">▼</span>
          </button>

          <!-- 用户下拉菜单 -->
          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="dropdown-item">
              <span>个人资料</span>
            </router-link>
            <router-link to="/settings" class="dropdown-item">
              <span>设置</span>
            </router-link>
            <router-link to="/ai-test" class="dropdown-item">
              <span>AI测试</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout-item">
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 底部标签栏（移动端） -->
    <nav class="mobile-nav">
      <router-link to="/" class="mobile-nav-item">
        <span>首页</span>
      </router-link>
      <router-link to="/items" class="mobile-nav-item">
        <span>物品</span>
      </router-link>
      <router-link to="/add" class="mobile-nav-item">
        <span>添加</span>
      </router-link>
      <router-link to="/search" class="mobile-nav-item">
        <span>搜索</span>
      </router-link>
      <router-link to="/insights" class="mobile-nav-item">
        <span>建议</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleLogout = () => {
  closeUserMenu();
  // 处理退出登录逻辑
  console.log('用户退出登录');
};

// 点击外部关闭下拉菜单
// const vClickOutside = {
//   mounted(el: any, binding: any) {
//     el.clickOutsideEvent = (event: Event) => {
//       if (!(el === event.target || el.contains(event.target))) {
//         binding.value();
//       }
//     };
//     document.addEventListener('click', el.clickOutsideEvent);
//   },
//   unmounted(el: any) {
//     document.removeEventListener('click', el.clickOutsideEvent);
//   }
// };
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #3b82f6;
}

.logo:hover {
  color: #2563eb;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.main-nav {
  display: none;
}

@media (min-width: 768px) {
  .main-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #111827;
  background: #f3f4f6;
}

.nav-link.active {
  color: #111827;
  background: #f3f4f6;
}

.user-section {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.user-menu-trigger:hover {
  background: #f3f4f6;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.user-menu-trigger:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-width: 12rem;
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item:first-child {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.logout-item {
  color: #dc2626;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

.logout-item:hover {
  background: #fef2f2;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.app-main {
  flex: 1;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 40;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
  min-width: 4rem;
}

.mobile-nav-item:hover {
  color: #374151;
}

.mobile-nav-item.active {
  color: #3b82f6;
}

.mobile-nav-item span {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>