-- 检查和修复所有表的权限
-- 这个迁移确保所有表都有正确的权限设置

-- 检查当前权限
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
    AND table_name IN ('items', 'categories', 'subcategories')
ORDER BY table_name, grantee, privilege_type;

-- 授予物品表权限
GRANT ALL ON items TO anon, authenticated;

-- 授予分类表权限
GRANT ALL ON categories TO anon, authenticated;

-- 授予子分类表权限
GRANT ALL ON subcategories TO anon, authenticated;

-- 重新检查权限
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
    AND table_name IN ('items', 'categories', 'subcategories')
ORDER BY table_name, grantee, privilege_type;