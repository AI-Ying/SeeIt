-- 创建物品表
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    purchase_location VARCHAR(200),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    tags TEXT[], -- PostgreSQL数组类型
    notes TEXT,
    image_urls TEXT[], -- 存储多个图片URL
    ai_suggested_category_id UUID REFERENCES categories(id),
    ai_confidence DECIMAL(3, 2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_subcategory_id ON items(subcategory_id);
CREATE INDEX idx_items_purchase_date ON items(purchase_date);
CREATE INDEX idx_items_condition ON items(condition);
CREATE INDEX idx_items_is_deleted ON items(is_deleted);
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- 创建GIN索引用于数组字段搜索
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_items_name_search ON items USING GIN(to_tsvector('english', name));
CREATE INDEX idx_items_description_search ON items USING GIN(to_tsvector('english', description));

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at 
    BEFORE UPDATE ON subcategories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();