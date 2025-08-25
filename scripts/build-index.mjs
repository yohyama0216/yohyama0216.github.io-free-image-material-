// scripts/build-index.mjs - メインビルドスクリプト
import fs from "fs/promises";
import path from "path";
import { 
  ROOT, 
  ASSETS_DIR, 
  ITEMS_DIR, 
  OUT_JSON, 
  OUT_SITEMAP, 
  VALID_EXTENSIONS 
} from "./config.mjs";
import { SlugGenerator, ensureDir } from "./utils.mjs";
import { processImages } from "./image-processor.mjs";
import { writeDetailPage } from "./html-generator.mjs";
import { generateSitemapXML, generateRoutes, getBaseUrl } from "./sitemap-generator.mjs";

/**
 * メインビルド処理
 */
async function build() {
  console.log("Starting build process...");
  
  try {
    // 初期設定
    await fs.writeFile(path.join(ROOT, ".nojekyll"), "");
    await ensureDir(ASSETS_DIR);
    await ensureDir(ITEMS_DIR);
    
    // スラグジェネレーター初期化
    const slugGenerator = new SlugGenerator();
    
    // 画像処理
    console.log("Processing images...");
    const items = await processImages(ASSETS_DIR, VALID_EXTENSIONS, slugGenerator);
    
    // 詳細ページ生成
    console.log("Generating detail pages...");
    for (const item of items) {
      await writeDetailPage(item);
    }
    
    // assets.json出力
    console.log("Generating assets.json...");
    const payload = { 
      updatedAt: new Date().toISOString(), 
      items 
    };
    await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));
    
    // sitemap.xml生成
    console.log("Generating sitemap.xml...");
    const baseUrl = getBaseUrl();
    const routes = generateRoutes(baseUrl, items);
    const sitemapXML = generateSitemapXML(baseUrl, routes);
    await fs.writeFile(OUT_SITEMAP, sitemapXML);
    
    // 完了レポート
    console.log("\n=== Build Complete ===");
    console.log(`Generated ${items.length} items + detail pages + sitemap.xml + assets.json`);
    console.log(`Items: ${items.length}`);
    console.log(`Categories: ${new Set(items.map(item => item.category)).size}`);
    console.log(`Total routes in sitemap: ${routes.length}`);
    
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

// ビルド実行
build();
