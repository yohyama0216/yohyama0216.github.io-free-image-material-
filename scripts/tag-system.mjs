// scripts/tag-system.mjs - 多対多タグシステム
import fs from "fs/promises";
import path from "path";

/**
 * 多対多タグシステムの設計
 * 
 * 構造:
 * - 各画像に .meta.json ファイル
 * - tags.json でタグ定義とメタデータ
 * - tag-mappings.json で自動タグルール
 */

export class TagSystem {
  constructor() {
    this.tags = new Map(); // タグID -> タグ情報
    this.images = new Map(); // 画像ID -> 画像情報
    this.tagMappings = new Map(); // パターン -> タグID[]
    this.imageTagRelations = new Map(); // 画像ID -> Set<タグID>
    this.tagImageRelations = new Map(); // タグID -> Set<画像ID>
  }

  /**
   * タグ定義を読み込み
   */
  async loadTagDefinitions(tagsJsonPath) {
    try {
      const content = await fs.readFile(tagsJsonPath, 'utf-8');
      const tagData = JSON.parse(content);
      
      tagData.tags.forEach(tag => {
        this.tags.set(tag.id, {
          id: tag.id,
          name: tag.name,
          description: tag.description || '',
          category: tag.category || 'general',
          color: tag.color || '#6c757d',
          aliases: tag.aliases || [],
          parent: tag.parent || null,
          children: tag.children || []
        });
      });
      
      console.log(`Loaded ${this.tags.size} tag definitions`);
    } catch (error) {
      console.warn('Could not load tag definitions:', error.message);
    }
  }

  /**
   * 自動タグマッピングルールを読み込み
   */
  async loadTagMappings(mappingsJsonPath) {
    try {
      const content = await fs.readFile(mappingsJsonPath, 'utf-8');
      const mappingData = JSON.parse(content);
      
      // ファイル名パターン
      Object.entries(mappingData.fileNamePatterns || {}).forEach(([pattern, tagIds]) => {
        this.tagMappings.set(`filename:${pattern}`, tagIds);
      });
      
      // ディレクトリパターン
      Object.entries(mappingData.directoryPatterns || {}).forEach(([pattern, tagIds]) => {
        this.tagMappings.set(`directory:${pattern}`, tagIds);
      });
      
      console.log(`Loaded ${this.tagMappings.size} tag mapping rules`);
    } catch (error) {
      console.warn('Could not load tag mappings:', error.message);
    }
  }

  /**
   * 画像のメタデータを読み込み
   */
  async loadImageMetadata(imagePath) {
    const metaPath = imagePath.replace(/\.(jpe?g|png|gif|webp)$/i, '.meta.json');
    try {
      const content = await fs.readFile(metaPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * 自動タグを生成
   */
  generateAutoTags(imagePath) {
    const autoTags = new Set();
    const fileName = path.basename(imagePath).toLowerCase();
    const dirPath = path.dirname(imagePath).toLowerCase();
    
    // ファイル名パターンマッチング
    this.tagMappings.forEach((tagIds, pattern) => {
      if (pattern.startsWith('filename:')) {
        const patternText = pattern.replace('filename:', '');
        if (fileName.includes(patternText)) {
          tagIds.forEach(tagId => autoTags.add(tagId));
        }
      } else if (pattern.startsWith('directory:')) {
        const patternText = pattern.replace('directory:', '');
        if (dirPath.includes(patternText)) {
          tagIds.forEach(tagId => autoTags.add(tagId));
        }
      }
    });
    
    return Array.from(autoTags);
  }

  /**
   * 画像にタグを関連付け
   */
  associateImageWithTags(imageId, tagIds) {
    // 画像->タグの関連
    if (!this.imageTagRelations.has(imageId)) {
      this.imageTagRelations.set(imageId, new Set());
    }
    const imageTags = this.imageTagRelations.get(imageId);
    
    // タグ->画像の関連
    tagIds.forEach(tagId => {
      imageTags.add(tagId);
      
      if (!this.tagImageRelations.has(tagId)) {
        this.tagImageRelations.set(tagId, new Set());
      }
      this.tagImageRelations.get(tagId).add(imageId);
    });
  }

  /**
   * 画像を処理してタグ関連付け
   */
  async processImage(imagePath, imageId) {
    // メタデータからタグを取得
    const metadata = await this.loadImageMetadata(imagePath);
    const manualTags = metadata?.tags || [];
    
    // 自動タグを生成
    const autoTags = this.generateAutoTags(imagePath);
    
    // すべてのタグを統合（重複排除）
    const allTags = Array.from(new Set([...manualTags, ...autoTags]));
    
    // 有効なタグのみをフィルタ
    const validTags = allTags.filter(tagId => this.tags.has(tagId));
    
    // 関連付けを保存
    this.associateImageWithTags(imageId, validTags);
    
    return {
      imageId,
      tags: validTags,
      manualTags,
      autoTags: autoTags.filter(tagId => this.tags.has(tagId))
    };
  }

  /**
   * タグに関連付けられた画像を取得
   */
  getImagesForTag(tagId) {
    return Array.from(this.tagImageRelations.get(tagId) || []);
  }

  /**
   * 画像に関連付けられたタグを取得
   */
  getTagsForImage(imageId) {
    return Array.from(this.imageTagRelations.get(imageId) || []);
  }

  /**
   * タグ統計情報を取得
   */
  getTagStats() {
    const stats = [];
    this.tags.forEach((tagInfo, tagId) => {
      const imageCount = this.tagImageRelations.get(tagId)?.size || 0;
      stats.push({
        ...tagInfo,
        imageCount
      });
    });
    return stats.sort((a, b) => b.imageCount - a.imageCount);
  }

  /**
   * 関連タグを取得（同じ画像に使用されているタグ）
   */
  getRelatedTags(tagId, limit = 10) {
    const relatedTagCounts = new Map();
    const imagesWithTag = this.getImagesForTag(tagId);
    
    imagesWithTag.forEach(imageId => {
      const imageTags = this.getTagsForImage(imageId);
      imageTags.forEach(otherTagId => {
        if (otherTagId !== tagId) {
          relatedTagCounts.set(otherTagId, (relatedTagCounts.get(otherTagId) || 0) + 1);
        }
      });
    });
    
    return Array.from(relatedTagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tagId, count]) => ({
        tag: this.tags.get(tagId),
        count
      }));
  }

  /**
   * タグ検索（部分一致、エイリアス対応）
   */
  searchTags(query, limit = 20) {
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    this.tags.forEach((tagInfo, tagId) => {
      let score = 0;
      
      // 名前の完全一致
      if (tagInfo.name.toLowerCase() === lowerQuery) score = 100;
      // 名前の前方一致
      else if (tagInfo.name.toLowerCase().startsWith(lowerQuery)) score = 80;
      // 名前の部分一致
      else if (tagInfo.name.toLowerCase().includes(lowerQuery)) score = 60;
      // エイリアスの一致
      else if (tagInfo.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) score = 40;
      // 説明の一致
      else if (tagInfo.description.toLowerCase().includes(lowerQuery)) score = 20;
      
      if (score > 0) {
        matches.push({
          ...tagInfo,
          score,
          imageCount: this.tagImageRelations.get(tagId)?.size || 0
        });
      }
    });
    
    return matches
      .sort((a, b) => b.score - a.score || b.imageCount - a.imageCount)
      .slice(0, limit);
  }
}

export default TagSystem;
