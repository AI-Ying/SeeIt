-- 创建主分类表
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建子分类表
CREATE TABLE subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_sort_order ON subcategories(sort_order);
CREATE INDEX idx_subcategories_is_active ON subcategories(is_active);

-- 插入默认分类数据
INSERT INTO categories (name, description, icon, sort_order) VALUES
    ('电子产品', '手机、电脑、相机等电子设备', '📱', 1),
    ('服装配饰', '衣服、鞋子、包包等时尚单品', '👕', 2),
    ('生活用品', '家居用品、清洁用品等日常必需品', '🏠', 3),
    ('书籍文具', '图书、笔记本、办公用品等', '📚', 4),
    ('食品饮料', '零食、饮料、保健品等', '🍎', 5),
    ('运动健身', '运动器材、健身用品等', '🏃', 6),
    ('美妆护肤', '化妆品、护肤品、香水等', '💄', 7),
    ('母婴用品', '婴儿用品、玩具、孕妇用品等', '🧸', 8);

-- 插入子分类数据
INSERT INTO subcategories (category_id, name, sort_order) VALUES
    -- 电子产品子分类
    ((SELECT id FROM categories WHERE name = '电子产品'), '手机', 1),
    ((SELECT id FROM categories WHERE name = '电子产品'), '电脑', 2),
    ((SELECT id FROM categories WHERE name = '电子产品'), '相机', 3),
    ((SELECT id FROM categories WHERE name = '电子产品'), '耳机', 4),
    ((SELECT id FROM categories WHERE name = '电子产品'), '充电器', 5),
    
    -- 服装配饰子分类
    ((SELECT id FROM categories WHERE name = '服装配饰'), '上衣', 1),
    ((SELECT id FROM categories WHERE name = '服装配饰'), '裤子', 2),
    ((SELECT id FROM categories WHERE name = '服装配饰'), '鞋子', 3),
    ((SELECT id FROM categories WHERE name = '服装配饰'), '包包', 4),
    ((SELECT id FROM categories WHERE name = '服装配饰'), '配饰', 5),
    
    -- 生活用品子分类
    ((SELECT id FROM categories WHERE name = '生活用品'), '厨房用品', 1),
    ((SELECT id FROM categories WHERE name = '生活用品'), '清洁用品', 2),
    ((SELECT id FROM categories WHERE name = '生活用品'), '收纳用品', 3),
    ((SELECT id FROM categories WHERE name = '生活用品'), '床上用品', 4),
    ((SELECT id FROM categories WHERE name = '生活用品'), '装饰用品', 5),
    
    -- 书籍文具子分类
    ((SELECT id FROM categories WHERE name = '书籍文具'), '图书', 1),
    ((SELECT id FROM categories WHERE name = '书籍文具'), '笔记本', 2),
    ((SELECT id FROM categories WHERE name = '书籍文具'), '笔类', 3),
    ((SELECT id FROM categories WHERE name = '书籍文具'), '办公用品', 4),
    ((SELECT id FROM categories WHERE name = '书籍文具'), '学习用品', 5),
    
    -- 食品饮料子分类
    ((SELECT id FROM categories WHERE name = '食品饮料'), '零食', 1),
    ((SELECT id FROM categories WHERE name = '食品饮料'), '饮料', 2),
    ((SELECT id FROM categories WHERE name = '食品饮料'), '保健品', 3),
    ((SELECT id FROM categories WHERE name = '食品饮料'), '茶叶', 4),
    ((SELECT id FROM categories WHERE name = '食品饮料'), '咖啡', 5),
    
    -- 运动健身子分类
    ((SELECT id FROM categories WHERE name = '运动健身'), '运动服装', 1),
    ((SELECT id FROM categories WHERE name = '运动健身'), '运动鞋', 2),
    ((SELECT id FROM categories WHERE name = '运动健身'), '健身器材', 3),
    ((SELECT id FROM categories WHERE name = '运动健身'), '球类用品', 4),
    ((SELECT id FROM categories WHERE name = '运动健身'), '户外用品', 5),
    
    -- 美妆护肤子分类
    ((SELECT id FROM categories WHERE name = '美妆护肤'), '护肤品', 1),
    ((SELECT id FROM categories WHERE name = '美妆护肤'), '彩妆', 2),
    ((SELECT id FROM categories WHERE name = '美妆护肤'), '香水', 3),
    ((SELECT id FROM categories WHERE name = '美妆护肤'), '美发用品', 4),
    ((SELECT id FROM categories WHERE name = '美妆护肤'), '美甲用品', 5),
    
    -- 母婴用品子分类
    ((SELECT id FROM categories WHERE name = '母婴用品'), '婴儿用品', 1),
    ((SELECT id FROM categories WHERE name = '母婴用品'), '玩具', 2),
    ((SELECT id FROM categories WHERE name = '母婴用品'), '孕妇用品', 3),
    ((SELECT id FROM categories WHERE name = '母婴用品'), '童装', 4),
    ((SELECT id FROM categories WHERE name = '母婴用品'), '童鞋', 5);