// scripts/tag-mapping.mjs - タグマッピング設定
export const TAG_MAPPING = {
  // ファイル名パターンによるタグ付け
  fileNamePatterns: {
    "button": ["ui", "interactive", "clickable"],
    "menu": ["ui", "navigation", "interface"],
    "sky": ["nature", "background", "outdoor"],
    "grass": ["nature", "ground", "green"],
    "room": ["interior", "indoor", "architecture"],
    "castle": ["building", "medieval", "architecture"],
    "cute": ["kawaii", "adorable", "lovely"]
  },

  // ディレクトリ構造によるタグ付け
  directoryTags: {
    "ui": ["interface"],
    "landscape": ["background", "scenery"],
    "character": ["sprite"],
    "effects": ["vfx", "animation"]
  },

  // カテゴリ別の自動タグ
  categoryTags: {
    "ui": ["user-interface", "gui"],
    "landscape": ["environment", "world"],
    "character": ["avatar"],
    "item": ["object", "prop"]
  },

  // 色による自動タグ（ファイル名に色が含まれる場合）
  colorTags: {
    "red": ["red", "warm-color"],
    "blue": ["blue", "cool-color"],
    "green": ["green", "nature-color"],
    "yellow": ["yellow", "bright-color"],
    "purple": ["purple", "mystical"],
    "black": ["black", "dark"],
    "white": ["white", "light"]
  }
};

/**
 * ファイルパスとメタデータからタグを生成
 */
export function generateTags(filePath, metadata = {}) {
  const tags = new Set();
  
  // ディレクトリ構造からタグを追加
  const pathParts = filePath.split('/').filter(Boolean);
  pathParts.forEach(part => {
    if (TAG_MAPPING.directoryTags[part]) {
      TAG_MAPPING.directoryTags[part].forEach(tag => tags.add(tag));
    }
  });
  
  // ファイル名からタグを生成
  const fileName = pathParts[pathParts.length - 1]?.toLowerCase() || '';
  Object.entries(TAG_MAPPING.fileNamePatterns).forEach(([pattern, patternTags]) => {
    if (fileName.includes(pattern)) {
      patternTags.forEach(tag => tags.add(tag));
    }
  });
  
  // 色のタグを追加
  Object.entries(TAG_MAPPING.colorTags).forEach(([color, colorTags]) => {
    if (fileName.includes(color)) {
      colorTags.forEach(tag => tags.add(tag));
    }
  });
  
  // カテゴリに基づくタグ
  const category = pathParts[0];
  if (category && TAG_MAPPING.categoryTags[category]) {
    TAG_MAPPING.categoryTags[category].forEach(tag => tags.add(tag));
  }
  
  // メタデータファイルからのタグ
  if (metadata.tags) {
    metadata.tags.forEach(tag => tags.add(tag));
  }
  
  return Array.from(tags);
}
