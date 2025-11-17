-- 最终修复权限和RLS策略
-- 这个迁移解决保存失败的问题

-- 1. 完全移除RLS限制（开发环境）
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;

-- 2. 确保所有权限正确设置
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 3. 具体表的权限设置
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subcategories TO anon, authenticated;

-- 4. 检查并修复存储桶权限
-- 确保存储桶存在
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('item-images', 'item-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. 完全开放存储权限（开发环境）
CREATE POLICY "完全开放的存储权限" ON storage.objects
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. 验证权限设置
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
    AND table_name IN ('items', 'categories', 'subcategories')
ORDER BY table_name, grantee, privilege_type;