-- 创建 item-images 存储桶并配置权限
-- 这个迁移将创建存储桶并设置所有必要的权限

-- 创建存储桶（如果不存在）
INSERT INTO storage.buckets (
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at,
    updated_at
) VALUES (
    'item-images', 
    'item-images', 
    true, 
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    updated_at = NOW();

-- 删除所有现有的存储权限策略
DROP POLICY IF EXISTS "允许上传物品图片" ON storage.objects;
DROP POLICY IF EXISTS "允许查看物品图片" ON storage.objects;
DROP POLICY IF EXISTS "允许更新物品图片" ON storage.objects;
DROP POLICY IF EXISTS "允许删除物品图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以上传物品图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以更新图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以删除图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以查看所有公共图片" ON storage.objects;
DROP POLICY IF EXISTS "完全开放的上传权限" ON storage.objects;
DROP POLICY IF EXISTS "完全开放的查看权限" ON storage.objects;
DROP POLICY IF EXISTS "完全开放的更新权限" ON storage.objects;
DROP POLICY IF EXISTS "完全开放的删除权限" ON storage.objects;

-- 创建完全开放的权限策略（仅用于开发和测试环境）
CREATE POLICY "完全开放的上传权限" ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "完全开放的查看权限" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "完全开放的更新权限" ON storage.objects
    FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "完全开放的删除权限" ON storage.objects
    FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'item-images');

-- 授予所有必要的权限
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- 验证存储桶创建
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'item-images';