import { ref, computed } from 'vue';

/**
 * 用户认证状态管理
 * 临时使用固定的UUID用户，后续可以集成真实的用户认证
 */
const userId = ref('00000000-0000-0000-0000-000000000000'); // 临时用户ID

/**
 * 获取当前用户ID
 */
export const useAuth = () => {
  const currentUserId = computed(() => userId.value);
  
  const isAuthenticated = computed(() => !!userId.value);
  
  const setUserId = (id: string) => {
    userId.value = id;
  };
  
  const logout = () => {
    userId.value = '';
  };
  
  return {
    userId: currentUserId,
    isAuthenticated,
    setUserId,
    logout
  };
};