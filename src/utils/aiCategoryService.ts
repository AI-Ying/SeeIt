import { extractKeywords, calculateSimilarity } from '@/utils/helpers';
import type { AICategorySuggestion, Item, Category } from '@/types';

/**
 * AI分类服务
 * 基于物品名称、描述和图片特征进行智能分类推荐
 */
export class AICategoryService {
  private categories: Category[] = [];
  private categoryKeywords: Map<string, string[]> = new Map();
  private itemHistory: Item[] = [];

  constructor() {
    this.initializeCategoryKeywords();
  }

  /**
   * 初始化分类关键词库
   */
  private initializeCategoryKeywords() {
    const keywordMap: Record<string, string[]> = {
      '电子产品': [
        '手机', '电脑', '笔记本', '平板', '耳机', '音响', '相机', '充电器',
        '数据线', '键盘', '鼠标', '显示器', '电视', '冰箱', '空调', '洗衣机',
        '智能手表', '手环', '路由器', '充电宝', '移动电源'
      ],
      '服装配饰': [
        '衣服', '裤子', '裙子', '外套', 'T恤', '衬衫', '毛衣', '羽绒服',
        '鞋子', '运动鞋', '皮鞋', '靴子', '包包', '钱包', '手表', '眼镜',
        '帽子', '围巾', '手套', '袜子', '内衣', '睡衣'
      ],
      '生活用品': [
        '杯子', '餐具', '锅具', '刀具', '收纳', '清洁', '毛巾', '浴巾',
        '床上用品', '枕头', '被子', '床单', '窗帘', '地毯', '灯具', '家具',
        '椅子', '桌子', '沙发', '床', '衣柜', '书架'
      ],
      '书籍文具': [
        '书籍', '图书', '小说', '教材', '笔记本', '笔', '铅笔', '钢笔',
        '橡皮', '尺子', '文具', '文件夹', '订书机', '胶水', '剪刀', '便利贴',
        '打印机', '墨盒', '纸张', '便签', '计算器'
      ],
      '食品饮料': [
        '咖啡', '茶叶', '零食', '饼干', '巧克力', '糖果', '饮料', '果汁',
        '牛奶', '酸奶', '面包', '蛋糕', '坚果', '干果', '蜂蜜', '调料',
        '酱油', '醋', '盐', '糖', '香料', '食用油'
      ],
      '运动健身': [
        '运动鞋', '运动服', '哑铃', '跑步机', '瑜伽垫', '健身', '运动',
        '篮球', '足球', '网球', '羽毛球', '乒乓球', '游泳', '骑行', '登山',
        '背包', '水壶', '毛巾', '护腕', '护膝'
      ],
      '美妆护肤': [
        '洗面奶', '面霜', '乳液', '精华', '面膜', '口红', '粉底', '眼影',
        '睫毛膏', '眼线笔', '腮红', '眉笔', '香水', '指甲油', '化妆刷',
        '卸妆水', '爽肤水', '防晒霜', '护手霜', '身体乳'
      ],
      '母婴用品': [
        '奶粉', '尿不湿', '婴儿', '儿童', '玩具', '奶瓶', '奶嘴', '婴儿车',
        '婴儿床', '安全座椅', '绘本', '拼图', '积木', '文具', '书包',
        '衣服', '鞋子', '帽子', '袜子', '餐具'
      ]
    };

    Object.entries(keywordMap).forEach(([category, keywords]) => {
      this.categoryKeywords.set(category, keywords);
    });
  }

  /**
   * 设置分类数据
   */
  setCategories(categories: Category[]) {
    this.categories = categories;
  }

  /**
   * 设置用户历史物品数据（用于个性化推荐）
   */
  setItemHistory(items: Item[]) {
    this.itemHistory = items;
  }

  /**
   * 获取AI分类建议
   */
  async getCategorySuggestion(itemData: {
    name: string;
    description?: string;
    image_urls?: string[];
    userId: string;
  }): Promise<AICategorySuggestion> {
    const { name, description = '' } = itemData;
    
    // 提取关键词
    const nameKeywords = extractKeywords(name);
    const descKeywords = extractKeywords(description);
    const allKeywords = [...nameKeywords, ...descKeywords];

    // 计算每个分类的得分
    const categoryScores = this.calculateCategoryScores(allKeywords, name, description);
    
    // 获取最佳分类
    const sortedCategories = Array.from(categoryScores.entries())
      .sort(([, a], [, b]) => b.score - a.score);

    if (sortedCategories.length === 0) {
      return this.createFallbackSuggestion();
    }

    const bestCategory = sortedCategories[0];
    if (!bestCategory) {
      return this.createFallbackSuggestion();
    }
    
    const bestCategoryData = this.categories.find(c => c.name === bestCategory[0]);
    
    if (!bestCategoryData) {
      return this.createFallbackSuggestion();
    }

    // 获取备选分类
    const alternatives = sortedCategories.slice(1, 4).map(([categoryName, data]) => {
      const category = this.categories.find(c => c.name === categoryName);
      return {
        category_id: category?.id || '',
        category_name: categoryName,
        confidence: Math.min(data.score, 0.9)
      };
    }).filter(alt => alt.category_id);

    return {
      category_id: bestCategoryData.id,
      category_name: bestCategoryData.name,
      confidence: Math.min(bestCategory[1].score, 0.95),
      reasons: bestCategory[1].reasons.slice(0, 3),
      alternatives
    };
  }

  /**
   * 计算分类得分
   */
  private calculateCategoryScores(
    keywords: string[],
    name: string,
    description: string
  ): Map<string, { score: number; reasons: string[] }> {
    const scores = new Map<string, { score: number; reasons: string[] }>();

    this.categories.forEach(category => {
      let totalScore = 0;
      const reasons: string[] = [];

      // 1. 关键词匹配得分 (40%)
      const keywordScore = this.calculateKeywordScore(keywords, category.name);
      if (keywordScore > 0) {
        totalScore += keywordScore * 0.4;
        reasons.push(`关键词匹配: ${Math.round(keywordScore * 100)}%`);
      }

      // 2. 名称相似度得分 (30%)
      const nameScore = calculateSimilarity(name, category.name);
      if (nameScore > 0.3) {
        totalScore += nameScore * 0.3;
        reasons.push(`名称相似度: ${Math.round(nameScore * 100)}%`);
      }

      // 3. 描述相似度得分 (20%)
      if (description) {
        const descScore = calculateSimilarity(description, category.name);
        if (descScore > 0.2) {
          totalScore += descScore * 0.2;
          reasons.push(`描述相关度: ${Math.round(descScore * 100)}%`);
        }
      }

      // 4. 历史偏好得分 (10%)
      const historyScore = this.calculateHistoryScore(category.id);
      if (historyScore > 0) {
        totalScore += historyScore * 0.1;
        reasons.push(`历史偏好: ${Math.round(historyScore * 100)}%`);
      }

      scores.set(category.name, { score: totalScore, reasons });
    });

    return scores;
  }

  /**
   * 计算关键词得分
   */
  private calculateKeywordScore(keywords: string[], categoryName: string): number {
    const categoryKeywords = this.categoryKeywords.get(categoryName) || [];
    if (categoryKeywords.length === 0) return 0;

    let matchCount = 0;
    keywords.forEach(keyword => {
      if (categoryKeywords.some(catKeyword => 
        catKeyword.includes(keyword) || keyword.includes(catKeyword)
      )) {
        matchCount++;
      }
    });

    return matchCount / Math.max(keywords.length, 1);
  }

  /**
   * 计算历史偏好得分
   */
  private calculateHistoryScore(categoryId: string): number {
    if (this.itemHistory.length === 0) return 0;

    const categoryItems = this.itemHistory.filter(item => item.category_id === categoryId);
    return categoryItems.length / this.itemHistory.length;
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

  /**
   * 学习用户反馈（用于改进推荐算法）
   */
  learnFromFeedback(itemId: string, originalSuggestion: string, userChoice: string) {
    // 记录用户选择，用于后续算法优化
    console.log(`学习反馈: 物品 ${itemId}，原建议: ${originalSuggestion}，用户选择: ${userChoice}`);
    
    // 这里可以实现更复杂的学习逻辑，比如：
    // 1. 更新关键词权重
    // 2. 调整个性化参数
    // 3. 记录到用户偏好模型
  }
}

/**
 * 创建AI分类服务实例
 */
export const createAICategoryService = () => new AICategoryService();