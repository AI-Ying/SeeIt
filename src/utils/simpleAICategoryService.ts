import type { AICategorySuggestion, Category } from '@/types';

/**
 * 简化的AI分类服务
 * 基于关键词匹配和简单规则进行分类推荐
 */
export class SimpleAICategoryService {
  private categories: Category[] = [];
  
  // 分类关键词映射
  private readonly categoryKeywords: Record<string, string[]> = {
    '电子产品': [
      '手机', '电脑', '笔记本', '平板', '耳机', '音响', '相机', '充电器',
      '数据线', '键盘', '鼠标', '显示器', '电视', '冰箱', '空调', '洗衣机',
      '智能手表', '手环', '路由器', '充电宝', '移动电源', 'iPhone', 'iPad',
      'MacBook', '华为', '小米', '三星', '索尼', '戴尔', '联想'
    ],
    '服装配饰': [
      '衣服', '裤子', '裙子', '外套', 'T恤', '衬衫', '毛衣', '羽绒服',
      '鞋子', '运动鞋', '皮鞋', '靴子', '包包', '钱包', '手表', '眼镜',
      '帽子', '围巾', '手套', '袜子', '内衣', '睡衣', '耐克', '阿迪达斯',
      '优衣库', 'ZARA', 'H&M', 'LV', '古驰'
    ],
    '生活用品': [
      '杯子', '餐具', '锅具', '刀具', '收纳', '清洁', '毛巾', '浴巾',
      '床上用品', '枕头', '被子', '床单', '窗帘', '地毯', '灯具', '家具',
      '椅子', '桌子', '沙发', '床', '衣柜', '书架', '宜家', '无印良品'
    ],
    '书籍文具': [
      '书籍', '图书', '小说', '教材', '笔记本', '笔', '铅笔', '钢笔',
      '橡皮', '尺子', '文具', '文件夹', '订书机', '胶水', '剪刀', '便利贴',
      '打印机', '墨盒', '纸张', '便签', '计算器', '编程', 'JavaScript',
      'Python', '设计', '小说'
    ],
    '食品饮料': [
      '咖啡', '茶叶', '零食', '饼干', '巧克力', '糖果', '饮料', '果汁',
      '牛奶', '酸奶', '面包', '蛋糕', '坚果', '干果', '蜂蜜', '调料',
      '酱油', '醋', '盐', '糖', '香料', '食用油', '星巴克', '雀巢', '可乐'
    ],
    '运动健身': [
      '运动鞋', '运动服', '哑铃', '跑步机', '瑜伽垫', '健身', '运动',
      '篮球', '足球', '网球', '羽毛球', '乒乓球', '游泳', '骑行', '登山',
      '背包', '水壶', '毛巾', '护腕', '护膝', '健身房', 'Keep'
    ],
    '美妆护肤': [
      '洗面奶', '面霜', '乳液', '精华', '面膜', '口红', '粉底', '眼影',
      '睫毛膏', '眼线笔', '腮红', '眉笔', '香水', '指甲油', '化妆刷',
      '卸妆水', '爽肤水', '防晒霜', '护手霜', '身体乳', '兰蔻', '雅诗兰黛',
      '欧莱雅', '美宝莲', 'SK-II'
    ],
    '母婴用品': [
      '奶粉', '尿不湿', '婴儿', '儿童', '玩具', '奶瓶', '奶嘴', '婴儿车',
      '婴儿床', '安全座椅', '绘本', '拼图', '积木', '文具', '书包',
      '衣服', '鞋子', '帽子', '袜子', '餐具', '美赞臣', '花王', '帮宝适'
    ]
  };

  /**
   * 设置分类数据
   */
  setCategories(categories: Category[]) {
    this.categories = categories;
  }

  /**
   * 获取AI分类建议
   */
  async getCategorySuggestion(itemData: {
    name: string;
    description?: string;
    userId: string;
  }): Promise<AICategorySuggestion> {
    const { name, description = '' } = itemData;
    
    // 提取关键词
    const text = `${name} ${description}`.toLowerCase();
    const categoryScores: Record<string, number> = {};
    
    // 计算每个分类的得分
    Object.entries(this.categoryKeywords).forEach(([categoryName, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      categoryScores[categoryName] = score;
    });
    
    // 找到最佳匹配的分类
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([_, score]) => score > 0);
    
    if (sortedCategories.length === 0) {
      return this.createFallbackSuggestion();
    }
    
    const bestCategoryData = sortedCategories[0];
    if (!bestCategoryData) {
      return this.createFallbackSuggestion();
    }
    
    const bestCategoryName = bestCategoryData[0];
    const bestScore = bestCategoryData[1];
    const bestCategory = this.categories.find(c => c.name === bestCategoryName);
    
    if (!bestCategory) {
      return this.createFallbackSuggestion();
    }
    
    // 计算置信度 (0.6-0.95之间)
    const confidence = Math.min(0.6 + (bestScore * 0.1), 0.95);
    
    // 生成推荐理由
    const reasons = [
      `匹配到 ${bestScore} 个关键词`,
      `基于物品名称和描述分析`,
      `符合${bestCategoryName}分类特征`
    ];
    
    // 获取备选分类
    const alternatives = sortedCategories.slice(1, 3).map(([categoryName, score]) => {
      const category = this.categories.find(c => c.name === categoryName);
      return {
        category_id: category?.id || '',
        category_name: categoryName,
        confidence: Math.min(0.4 + (score * 0.1), 0.8)
      };
    }).filter(alt => alt.category_id);
    
    return {
      category_id: bestCategory.id,
      category_name: bestCategory.name,
      confidence,
      reasons,
      alternatives
    };
  }

  /**
   * 创建备选建议
   */
  private createFallbackSuggestion(): AICategorySuggestion {
    const defaultCategory = this.categories[0];
    return {
      category_id: defaultCategory?.id || 'other',
      category_name: defaultCategory?.name || '其他',
      confidence: 0.3,
      reasons: ['基于通用分类规则'],
      alternatives: []
    };
  }
}

/**
 * 创建简化AI分类服务实例
 */
export const createSimpleAICategoryService = () => new SimpleAICategoryService();