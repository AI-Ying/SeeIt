import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// 模拟用户认证（因为我们使用固定用户ID）
export async function simulateAuth() {
  try {
    // 尝试获取当前会话
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('没有活跃会话，模拟匿名访问');
      // 对于匿名访问，我们依赖宽松的RSL策略
    } else {
      console.log('已有活跃会话:', session.user.id);
    }
  } catch (error) {
    console.error('模拟认证失败:', error);
  }
}

// 初始化时调用模拟认证
simulateAuth();