-- 进一步放宽存储权限 - 允许匿名用户上传图片
-- 由于我们使用固定的用户ID而不是真实的认证系统

-- 删除现有的权限策略
DROP POLICY IF EXISTS "用户可以上传物品图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以更新图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以删除图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以查看所有公共图片" ON storage.objects;

-- 创建完全开放的权限策略（仅用于测试环境）
CREATE POLICY "允许上传物品图片" ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "允许查看物品图片" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "允许更新物品图片" ON storage.objects
    FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "允许删除物品图片" ON storage.objects
    FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'item-images');

-- 确保存储桶配置正确
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('item-images', 'item-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;