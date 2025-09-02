const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 画像フォルダのパス
const sourceDir = path.join(__dirname, '../public/assets');
const outputDir = path.join(__dirname, '../public/assets');

// WebP生成対象の拡張子
const imageExtensions = ['.jpg', '.jpeg', '.png'];

// ディレクトリを再帰的に処理する関数
async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // ディレクトリの場合は再帰的に処理
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      // ファイルの場合は画像かチェック
      const ext = path.extname(entry.name).toLowerCase();
      if (imageExtensions.includes(ext)) {
        await generateWebP(fullPath);
      }
    }
  }
}

// WebP画像を生成する関数
async function generateWebP(imagePath) {
  try {
    const { dir, name } = path.parse(imagePath);
    const webpPath = path.join(dir, `${name}.webp`);
    
    // 既存のWebPファイルがある場合はスキップ
    if (fs.existsSync(webpPath)) {
      const originalStat = fs.statSync(imagePath);
      const webpStat = fs.statSync(webpPath);
      
      // 元画像の方が新しい場合のみ再生成
      if (originalStat.mtime <= webpStat.mtime) {
        console.log(`Skipping ${webpPath} (already exists and up to date)`);
        return;
      }
    }
    
    await sharp(imagePath)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log(`Generated: ${webpPath}`);
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
  }
}

// サムネイル用のWebP生成（サイズ調整付き）
async function generateThumbnailWebP(imagePath, outputPath, size = 400) {
  try {
    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`Generated thumbnail: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating thumbnail ${outputPath}:`, error);
  }
}

// メイン処理
async function main() {
  console.log('Starting WebP generation...');
  
  // 通常のWebP生成
  if (fs.existsSync(sourceDir)) {
    await processDirectory(sourceDir);
  } else {
    console.warn(`Source directory ${sourceDir} does not exist`);
  }
  
  // サムネイル用WebP生成
  const thumbsDir = path.join(sourceDir, '_thumbs');
  if (fs.existsSync(thumbsDir)) {
    console.log('Generating WebP thumbnails...');
    const thumbFiles = fs.readdirSync(thumbsDir);
    
    for (const file of thumbFiles) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const originalPath = path.join(thumbsDir, file);
        const { name } = path.parse(file);
        const webpPath = path.join(thumbsDir, `${name}.webp`);
        
        // 既存チェック
        if (fs.existsSync(webpPath)) {
          const originalStat = fs.statSync(originalPath);
          const webpStat = fs.statSync(webpPath);
          if (originalStat.mtime <= webpStat.mtime) {
            continue;
          }
        }
        
        await sharp(originalPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        console.log(`Generated thumbnail WebP: ${webpPath}`);
      }
    }
  }
  
  console.log('WebP generation completed!');
}

// スクリプトが直接実行された場合
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generateWebP, generateThumbnailWebP };
