-- 启用行级安全(RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 分类表权限（所有用户都可以读取分类信息）
CREATE POLICY "任何人都可以读取分类" ON categories
    FOR SELECT
    USING (is_active = true);

-- 子分类表权限（所有用户都可以读取子分类信息）
CREATE POLICY "任何人都可以读取子分类" ON subcategories
    FOR SELECT
    USING (is_active = true);

-- 物品表权限（用户只能操作自己的物品）
CREATE POLICY "用户只能查看自己的物品" ON items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的物品" ON items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的物品" ON items
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的物品" ON items
    FOR DELETE
    USING (auth.uid() = user_id);

-- 授予权限给anon和authenticated角色
-- 分类和子分类读取权限
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON subcategories TO anon, authenticated;

-- 物品表权限
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO authenticated;
GRANT SELECT ON items TO anon; -- 匿名用户只能查看（如果需要）

-- 创建存储桶用于图片存储
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('item-images', 'item-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 存储权限（用户只能上传和管理自己的图片）
-- 临时放宽权限，允许任何用户上传图片（因为我们使用固定用户ID）
CREATE POLICY "用户可以上传物品图片" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "用户可以查看所有公共图片" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "用户可以更新图片" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'item-images');

CREATE POLICY "用户可以删除图片" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'item-images');

-- 授予存储权限
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;