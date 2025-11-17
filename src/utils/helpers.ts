// 文件验证工具函数
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证文件是否符合要求
 */
export function validateFile(file: File): FileValidationResult {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '请选择图片文件' };
  }

  // 检查文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过10MB' };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * 提取关键词
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // 简单的关键词提取：移除停用词并提取有意义的词
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '些', '个', '为', '之', '于', '及', '而', '后', '及', '与', '对', '或', '但', '如果', '因为', '所以', '虽然', '然而'
  ]);
  
  // 分词（简单版本，基于字符）
  const words = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
  
  return words
    .filter(word => word.length > 1 && !stopWords.has(word.toLowerCase()))
    .slice(0, 10); // 最多返回10个关键词
}

/**
 * 计算文本相似度（简单的余弦相似度）
 */
export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const keywords1 = extractKeywords(text1.toLowerCase());
  const keywords2 = extractKeywords(text2.toLowerCase());
  
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  // 计算交集
  const intersection = keywords1.filter(keyword => keywords2.includes(keyword));
  
  // 简单的相似度计算
  return intersection.length / Math.max(keywords1.length, keywords2.length);
}

/**
 * 计算编辑距离（Levenshtein距离）
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [];
    matrix[i][0] = i;
  }
  
  for (let j = 0; j <= str1.length; j++) {
    if (matrix[0]) {
      matrix[0][j] = j;
    }
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}