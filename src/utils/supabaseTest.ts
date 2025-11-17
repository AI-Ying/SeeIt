import { supabase } from '@/utils/supabase';

/**
 * 测试Supabase连接
 */
export async function testSupabaseConnection() {
  try {
    // 测试分类表查询
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    if (categoriesError) {
      console.error('分类表查询失败:', categoriesError);
      return false;
    }

    console.log('✅ 分类表连接成功，找到', categories?.length || 0, '个分类');

    // 测试子分类表查询
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*')
      .limit(5);

    if (subcategoriesError) {
      console.error('子分类表查询失败:', subcategoriesError);
      return false;
    }

    console.log('✅ 子分类表连接成功，找到', subcategories?.length || 0, '个子分类');

    // 测试物品表查询（应该为空）
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.error('物品表查询失败:', itemsError);
      return false;
    }

    console.log('✅ 物品表连接成功，当前有', items?.length || 0, '个物品');

    // 测试存储桶
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('存储桶查询失败:', bucketsError);
      return false;
    }

    console.log('✅ 存储服务连接成功，找到', buckets?.length || 0, '个存储桶');

    return true;
  } catch (error) {
    console.error('Supabase连接测试失败:', error);
    return false;
  }
}

/**
 * 测试添加示例物品
 */
export async function testAddSampleItem() {
  try {
    // 获取第一个分类
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();

    if (!categories) {
      console.error('没有找到分类');
      return false;
    }

    // 创建测试物品
    const testItem = {
      user_id: '00000000-0000-0000-0000-000000000000', // 测试用户ID
      name: '测试物品 - iPhone 15',
      description: '这是一个测试物品，用于验证Supabase集成',
      brand: 'Apple',
      model: 'iPhone 15',
      condition: 'new' as const,
      category_id: categories.id,
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 6999.00,
      purchase_location: 'Apple Store',
      quantity: 1,
      tags: ['手机', '苹果', '测试'],
      notes: '这是测试数据，可以安全删除',
      image_urls: ['https://via.placeholder.com/300x300?text=iPhone+15'],
      ai_suggested_category_id: categories.id,
      ai_confidence: 0.95
    };

    const { data, error } = await supabase
      .from('items')
      .insert(testItem)
      .select()
      .single();

    if (error) {
      console.error('添加测试物品失败:', error);
      return false;
    }

    console.log('✅ 成功添加测试物品:', data?.name);
    return true;
  } catch (error) {
    console.error('添加测试物品失败:', error);
    return false;
  }
}