// scripts/incremental-build.mjs
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { 
  ROOT, 
  ASSETS_DIR, 
  ITEMS_DIR, 
  OUT_JSON, 
  OUT_SITEMAP, 
  VALID_EXTENSIONS 
} from "./config.mjs";
import { SlugGenerator, ensureDir } from "./utils.mjs";
import { processImage } from "./image-processor.mjs";
import { writeDetailPage } from "./html-generator.mjs";
import { generateSitemapXML, generateRoutes, getBaseUrl } from "./sitemap-generator.mjs";

const BUILD_CACHE_FILE = path.join(ROOT, ".build-cache.json");

/**
 * ファイルのハッシュを計算
 */
async function calculateFileHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  } catch (error) {
    return null;
  }
}

/**
 * ビルドキャッシュを読み込み
 */
async function loadBuildCache() {
  try {
    const cacheContent = await fs.readFile(BUILD_CACHE_FILE, 'utf8');
    return JSON.parse(cacheContent);
  } catch (error) {
    // キャッシュファイルが存在しない場合は空のキャッシュを返す
    return {
      lastBuild: null,
      files: {}, // { filePath: { hash, lastModified, item } }
      items: []
    };
  }
}

/**
 * ビルドキャッシュを保存
 */
async function saveBuildCache(cache) {
  await fs.writeFile(BUILD_CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * assetsディレクトリ内の全画像ファイルを取得
 */
async function getAllImageFiles() {
  const imageFiles = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // _thumbs ディレクトリは除外
        if (entry.name !== '_thumbs') {
          await walkDir(fullPath);
        }
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (VALID_EXTENSIONS.has(ext)) {
          imageFiles.push(fullPath);
        }
      }
    }
  }
  
  await walkDir(ASSETS_DIR);
  return imageFiles;
}

/**
 * 変更されたファイルを検出
 */
async function detectChangedFiles(cache, currentFiles) {
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    unchanged: []
  };
  
  // 現在のファイルをチェック
  for (const filePath of currentFiles) {
    const currentHash = await calculateFileHash(filePath);
    const stats = await fs.stat(filePath);
    const lastModified = stats.mtime.getTime();
    
    const cached = cache.files[filePath];
    
    if (!cached) {
      // 新規ファイル
      changes.added.push({
        path: filePath,
        hash: currentHash,
        lastModified
      });
    } else if (cached.hash !== currentHash) {
      // 変更されたファイル
      changes.modified.push({
        path: filePath,
        hash: currentHash,
        lastModified,
        oldItem: cached.item
      });
    } else {
      // 変更なし
      changes.unchanged.push({
        path: filePath,
        hash: currentHash,
        lastModified,
        item: cached.item
      });
    }
  }
  
  // 削除されたファイルをチェック
  const currentFilePaths = new Set(currentFiles);
  for (const cachedPath in cache.files) {
    if (!currentFilePaths.has(cachedPath)) {
      changes.deleted.push({
        path: cachedPath,
        item: cache.files[cachedPath].item
      });
    }
  }
  
  return changes;
}

/**
 * 削除されたアイテムのクリーンアップ
 */
async function cleanupDeletedItems(deletedFiles) {
  for (const deleted of deletedFiles) {
    if (deleted.item && deleted.item.slug) {
      const itemDir = path.join(ITEMS_DIR, deleted.item.slug);
      try {
        await fs.rmdir(itemDir, { recursive: true });
        console.log(`Cleaned up: ${deleted.item.title} (${deleted.path})`);
      } catch (error) {
        console.warn(`Failed to cleanup ${itemDir}:`, error.message);
      }
    }
  }
}

/**
 * 増分ビルド実行
 */
async function incrementalBuild() {
  console.log("Starting incremental build...");
  
  // コマンドライン引数をチェック
  const args = process.argv.slice(2);
  const forceTemplateRegen = args.includes('--force-templates');
  
  try {
    // 初期設定
    await fs.writeFile(path.join(ROOT, ".nojekyll"), "");
    await ensureDir(ASSETS_DIR);
    await ensureDir(ITEMS_DIR);
    
    // キャッシュ読み込み
    const cache = await loadBuildCache();
    console.log(`Previous build: ${cache.lastBuild ? new Date(cache.lastBuild).toLocaleString() : 'Never'}`);
    
    // 現在のファイル一覧取得
    const currentFiles = await getAllImageFiles();
    console.log(`Found ${currentFiles.length} image files`);
    
    // 変更検出
    const changes = await detectChangedFiles(cache, currentFiles);
    console.log(`Changes detected:`);
    console.log(`  Added: ${changes.added.length}`);
    console.log(`  Modified: ${changes.modified.length}`);
    console.log(`  Deleted: ${changes.deleted.length}`);
    console.log(`  Unchanged: ${changes.unchanged.length}`);
    
    // テンプレート強制再生成の場合
    if (forceTemplateRegen) {
      console.log("🎨 Force regenerating all detail pages due to template changes...");
      // 全アイテムの詳細ページを再生成
      const allItems = [...changes.unchanged.map(f => f.item), ...cache.items].filter(Boolean);
      for (const item of allItems) {
        if (item && item.slug) {
          await writeDetailPage(item);
          console.log(`Regenerated: ${item.title}`);
        }
      }
      
      // assets.json と sitemap.xml も更新
      const payload = { 
        updatedAt: new Date().toISOString(), 
        items: allItems 
      };
      await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));
      
      const baseUrl = getBaseUrl();
      const routes = generateRoutes(baseUrl, allItems);
      const sitemapXML = generateSitemapXML(baseUrl, routes);
      await fs.writeFile(OUT_SITEMAP, sitemapXML);
      
      console.log(`\n=== Template Regeneration Complete ===`);
      console.log(`Regenerated ${allItems.length} detail pages`);
      return;
    }
    
    // 変更がない場合はスキップ
    if (changes.added.length === 0 && changes.modified.length === 0 && changes.deleted.length === 0) {
      console.log("No changes detected. Skipping build.");
      return;
    }
    
    // スラグジェネレーター初期化（既存のスラグを考慮）
    const slugGenerator = new SlugGenerator();
    const existingItems = [...changes.unchanged.map(f => f.item), ...cache.items];
    for (const item of existingItems) {
      if (item && item.slug) {
        // 既存のスラグを登録して重複を避ける
        const baseSlug = item.slug.replace(/-\d+$/, ''); // 末尾の数字を除去
        slugGenerator.counter.set(baseSlug, 0);
      }
    }
    
    // 新規・変更ファイルの処理
    const processedItems = [];
    const filesToProcess = [...changes.added, ...changes.modified];
    
    for (const fileChange of filesToProcess) {
      console.log(`Processing: ${path.relative(ROOT, fileChange.path)}`);
      const item = await processImage(fileChange.path, slugGenerator);
      await writeDetailPage(item);
      processedItems.push(item);
    }
    
    // 削除されたアイテムのクリーンアップ
    if (changes.deleted.length > 0) {
      await cleanupDeletedItems(changes.deleted);
    }
    
    // 全アイテムリストを作成（変更なし + 新規・変更）
    const allItems = [
      ...changes.unchanged.map(f => f.item),
      ...processedItems
    ];
    
    // assets.json更新
    console.log("Updating assets.json...");
    const payload = { 
      updatedAt: new Date().toISOString(), 
      items: allItems 
    };
    await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));
    
    // sitemap.xml更新
    console.log("Updating sitemap.xml...");
    const baseUrl = getBaseUrl();
    const routes = generateRoutes(baseUrl, allItems);
    const sitemapXML = generateSitemapXML(baseUrl, routes);
    await fs.writeFile(OUT_SITEMAP, sitemapXML);
    
    // キャッシュ更新
    const newCache = {
      lastBuild: new Date().toISOString(),
      files: {},
      items: allItems
    };
    
    // 全ファイルの情報をキャッシュに保存
    for (const filePath of currentFiles) {
      const hash = await calculateFileHash(filePath);
      const stats = await fs.stat(filePath);
      const item = allItems.find(item => 
        item.file === `assets/${path.relative(ASSETS_DIR, filePath).split(path.sep).join("/")}`
      );
      
      newCache.files[filePath] = {
        hash,
        lastModified: stats.mtime.getTime(),
        item
      };
    }
    
    await saveBuildCache(newCache);
    
    // 完了レポート
    console.log("\n=== Incremental Build Complete ===");
    console.log(`Processed ${processedItems.length} new/modified items`);
    console.log(`Cleaned up ${changes.deleted.length} deleted items`);
    console.log(`Total items: ${allItems.length}`);
    console.log(`Categories: ${new Set(allItems.map(item => item.category)).size}`);
    console.log(`Total routes in sitemap: ${routes.length}`);
    
  } catch (error) {
    console.error("Incremental build failed:", error);
    process.exit(1);
  }
}

// ビルド実行
incrementalBuild();
