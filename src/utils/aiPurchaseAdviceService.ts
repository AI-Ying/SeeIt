import type { AIPurchaseAdvice, Item } from '@/types';

/**
 * AI消费建议服务
 * 基于用户的物品数据和消费行为提供个性化的购买建议
 */
export class AIPurchaseAdviceService {
  private userItems: Item[] = [];
  private spendingPatterns = {
    monthlyBudget: 2000,
    averageItemPrice: 150,
    categorySpending: new Map<string, number>(),
    purchaseFrequency: new Map<string, number>()
  };

  /**
   * 设置用户物品数据
   */
  setUserItems(items: Item[]) {
    this.userItems = items;
    this.analyzeSpendingPatterns();
  }

  /**
   * 分析消费模式
   */
  private analyzeSpendingPatterns() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    this.spendingPatterns.categorySpending.clear();
    this.spendingPatterns.purchaseFrequency.clear();

    this.userItems.forEach(item => {
      // 分类消费统计
      const category = this.spendingPatterns.categorySpending.get(item.category_id) || 0;
      this.spendingPatterns.categorySpending.set(
        item.category_id, 
        category + (item.purchase_price || 0)
      );

      // 购买频率统计（基于购买日期）
      if (item.purchase_date) {
        const purchaseDate = new Date(item.purchase_date);
        if (purchaseDate >= lastMonth) {
          const categoryFreq = this.spendingPatterns.purchaseFrequency.get(item.category_id) || 0;
          this.spendingPatterns.purchaseFrequency.set(item.category_id, categoryFreq + 1);
        }
      }
    });
  }

  /**
   * 获取购买建议
   */
  async getPurchaseAdvice(itemData: {
    name: string;
    category_id: string;
    price?: number;
    userId: string;
  }): Promise<AIPurchaseAdvice> {
    const { name, category_id, price = 0 } = itemData;
    
    // 分析购买风险
    const riskFactors = this.analyzePurchaseRisk(name, category_id, price);
    
    // 查找相似物品
    const similarItems = this.findSimilarItems(name, category_id);
    
    // 生成建议
    return this.generateAdvice(riskFactors, similarItems, price, category_id);
  }

  /**
   * 分析购买风险
   */
  private analyzePurchaseRisk(name: string, categoryId: string, price: number) {
    const risks = {
      duplicateRisk: 0,
      budgetRisk: 0,
      impulseRisk: 0,
      categoryOveruse: 0
    };

    // 1. 重复购买风险
    const similarItems = this.userItems.filter(item => {
      const similarity = this.calculateItemSimilarity(name, item.name);
      return similarity > 0.7; // 相似度阈值
    });
    
    risks.duplicateRisk = Math.min(similarItems.length * 0.3, 1.0);

    // 2. 预算风险
    const monthlySpending = Array.from(this.spendingPatterns.categorySpending.values())
      .reduce((sum, spending) => sum + spending, 0);
    
    if (monthlySpending + price > this.spendingPatterns.monthlyBudget) {
      risks.budgetRisk = 0.8;
    } else if (price > this.spendingPatterns.averageItemPrice * 2) {
      risks.budgetRisk = 0.6;
    }

    // 3. 冲动购买风险（基于近期购买频率）
    const recentCategoryPurchases = this.spendingPatterns.purchaseFrequency.get(categoryId) || 0;
    if (recentCategoryPurchases >= 3) {
      risks.impulseRisk = 0.7;
    } else if (recentCategoryPurchases >= 2) {
      risks.impulseRisk = 0.4;
    }

    // 4. 分类过度消费风险
    const categorySpending = this.spendingPatterns.categorySpending.get(categoryId) || 0;
    const avgCategorySpending = monthlySpending / Math.max(this.spendingPatterns.categorySpending.size, 1);
    
    if (categorySpending > avgCategorySpending * 2) {
      risks.categoryOveruse = 0.6;
    }

    return risks;
  }

  /**
   * 查找相似物品
   */
  private findSimilarItems(name: string, categoryId: string) {
    return this.userItems
      .filter(item => {
        const nameSimilarity = this.calculateItemSimilarity(name, item.name);
        const categoryMatch = item.category_id === categoryId;
        return nameSimilarity > 0.5 || (nameSimilarity > 0.3 && categoryMatch);
      })
      .map(item => ({
        id: item.id,
        name: item.name,
        image_url: item.image_urls?.[0] || '',
        similarity_score: this.calculateItemSimilarity(name, item.name)
      }))
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 3);
  }

  /**
   * 计算物品相似度
   */
  private calculateItemSimilarity(name1: string, name2: string): number {
    const keywords1 = name1.toLowerCase().split(/\s+/);
    const keywords2 = name2.toLowerCase().split(/\s+/);
    
    const intersection = keywords1.filter(k1 => 
      keywords2.some(k2 => k1.includes(k2) || k2.includes(k1))
    );
    
    const union = [...new Set([...keywords1, ...keywords2])];
    return intersection.length / union.length;
  }

  /**
   * 生成购买建议
   */
  private generateAdvice(
    risks: Record<string, number>,
    similarItems: any[],
    price: number,
    categoryId: string
  ): AIPurchaseAdvice {
    const totalRisk = Object.values(risks).reduce((sum: number, risk: number) => sum + risk, 0) / 4;
    
    let adviceType: 'wait' | 'buy' | 'consider' | 'avoid';
    let confidence = 1 - totalRisk;
    const reasons: string[] = [];

    // 确定建议类型
    if (totalRisk > 0.7) {
      adviceType = 'avoid';
      confidence = Math.max(confidence, 0.8);
    } else if (totalRisk > 0.5) {
      adviceType = 'wait';
      confidence = Math.max(confidence, 0.6);
    } else if (totalRisk > 0.3) {
      adviceType = 'consider';
      confidence = Math.max(confidence, 0.4);
    } else {
      adviceType = 'buy';
      confidence = Math.max(confidence, 0.7);
    }

    // 生成具体原因
    if (risks.duplicateRisk && risks.duplicateRisk > 0.5) {
      reasons.push(`检测到${similarItems.length}个相似物品，可能存在重复购买`);
    }
    
    if (risks.budgetRisk && risks.budgetRisk > 0.5) {
      reasons.push('此物品价格超出您的平均消费水平，可能影响预算');
    }
    
    if (risks.impulseRisk && risks.impulseRisk > 0.4) {
      const categoryName = this.getCategoryName(categoryId);
      reasons.push(`您近期在"${categoryName}"分类下购买频繁，建议冷静思考`);
    }
    
    if (risks.categoryOveruse && risks.categoryOveruse > 0.4) {
      reasons.push('该分类消费已超出您的平均水平，建议平衡消费结构');
    }

    // 生成备选建议
    const alternatives = this.generateAlternatives(similarItems, price, adviceType);

    return {
      type: adviceType,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['基于您的消费数据分析，此购买决策较为合理'],
      similar_items: similarItems,
      alternatives,
      market_analysis: this.generateMarketAnalysis(price, categoryId)
    };
  }

  /**
   * 生成备选方案
   */
  private generateAlternatives(
    _similarItems: any[],
    price: number,
    adviceType: string
  ) {
    const alternatives = [];

    if (adviceType === 'avoid' || adviceType === 'wait') {
      alternatives.push({
        name: '使用现有物品',
        reason: '您已有相似物品，建议先充分利用现有资源',
        price_range: undefined
      });
    }

    if (price > this.spendingPatterns.averageItemPrice) {
      alternatives.push({
        name: '寻找性价比更高的替代品',
        reason: '市场上有价格更合理的相似产品',
        price_range: {
          min: Math.max(10, price * 0.5),
          max: price * 0.8
        }
      });
    }

    if (adviceType === 'consider') {
      alternatives.push({
        name: '等待促销时机',
        reason: '关注价格变化，选择合适的购买时机',
        price_range: {
          min: Math.max(10, price * 0.7),
          max: price * 0.9
        }
      });
    }

    return alternatives;
  }

  /**
   * 生成市场分析
   */
  private generateMarketAnalysis(price: number, categoryId: string) {
    const categorySpending = this.spendingPatterns.categorySpending.get(categoryId) || 0;
    const categoryCount = this.userItems.filter(item => item.category_id === categoryId).length;
    const avgCategoryPrice = categoryCount > 0 ? categorySpending / categoryCount : price;

    let priceTrend: 'up' | 'down' | 'stable' = 'stable';
    if (price > avgCategoryPrice * 1.2) {
      priceTrend = 'up';
    } else if (price < avgCategoryPrice * 0.8) {
      priceTrend = 'down';
    }

    return {
      average_price: Math.round(avgCategoryPrice),
      price_trend: priceTrend,
      best_time_to_buy: priceTrend === 'up' ? '等待促销或寻找替代品' : '当前价格较为合理'
    };
  }

  /**
   * 获取分类名称
   */
  private getCategoryName(categoryId: string): string {
    // 这里应该根据categoryId获取分类名称
    // 暂时返回ID
    return categoryId;
  }

  /**
   * 学习用户反馈
   */
  learnFromFeedback(decision: 'accepted' | 'rejected' | 'ignored', itemData: any) {
    // 记录用户决策，用于改进算法
    console.log(`AI建议反馈: ${decision}`, itemData);
    
    // 根据反馈调整参数
    if (decision === 'rejected') {
      // 用户拒绝了建议，可能需要调整风险评估阈值
      this.adjustRiskThresholds(0.9);
    } else if (decision === 'accepted') {
      // 用户接受了建议，确认算法准确性
      this.adjustRiskThresholds(1.1);
    }
  }

  /**
   * 调整风险阈值
   */
  private adjustRiskThresholds(factor: number) {
    // 动态调整风险评估参数
    this.spendingPatterns.monthlyBudget *= factor;
    this.spendingPatterns.averageItemPrice *= factor;
  }
}

/**
   * 创建AI消费建议服务实例
   */
export const createAIPurchaseAdviceService = () => new AIPurchaseAdviceService();