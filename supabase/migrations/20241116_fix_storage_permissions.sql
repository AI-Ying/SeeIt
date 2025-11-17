-- 修复存储权限问题 - 放宽图片上传限制
-- 因为我们使用固定的用户ID而不是真实的认证系统

-- 删除旧的严格权限策略
DROP POLICY IF EXISTS "用户可以上传自己的物品图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以更新自己的图片" ON storage.objects;
DROP POLICY IF EXISTS "用户可以删除自己的图片" ON storage.objects;

-- 创建更宽松的权限策略
CREATE POLICY "用户可以上传物品图片" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "用户可以更新图片" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "用户可以删除图片" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'item-images');

-- 确保存储桶存在且配置正确
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('item-images', 'item-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;