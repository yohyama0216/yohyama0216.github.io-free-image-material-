// scripts/image-processor.mjs
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ASSETS_DIR, THUMBS_DIR, THUMBNAIL_WIDTH, THUMBNAIL_QUALITY, DEFAULT_LICENSE } from "./config.mjs";
import { toSlug, ensureDir, formatSize } from "./utils.mjs";

/**
 * 画像ファイルを処理してアイテム情報を生成
 */
export async function processImage(fullPath, slugGenerator) {
  const relFromAssets = path.relative(ASSETS_DIR, fullPath).split(path.sep).join("/");
  const base = path.parse(relFromAssets).name;
  const title = base.replace(/[-_]+/g, " ").trim();
  const parts = relFromAssets.split("/");
  const category = parts[0] || "misc";
  const tags = Array.from(new Set(parts.slice(0, -1).filter(Boolean)));

  // スラグ生成
  const slugBase = toSlug(`${category}-${base}`);
  const slug = slugGenerator.generate(slugBase);

  // 画像メタ情報取得
  const img = sharp(fullPath);
  const meta = await img.metadata();

  // サムネイル作成
  const thumbRelDir = path.join("_thumbs", path.dirname(relFromAssets)).split(path.sep).join("/");
  const thumbFile = `${base}-${THUMBNAIL_WIDTH}.jpg`;
  const thumbRel = `assets/${thumbRelDir}/${thumbFile}`;
  const thumbAbsDir = path.join(THUMBS_DIR, path.dirname(relFromAssets));
  
  await ensureDir(thumbAbsDir);
  await img.resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
           .jpeg({ quality: THUMBNAIL_QUALITY })
           .toFile(path.join(thumbAbsDir, thumbFile));

  // ファイルサイズ取得
  const stats = await fs.stat(fullPath);
  const bytes = stats.size;

  const item = {
    id: base,
    slug,
    title,
    category,
    tags,
    width: meta.width ?? null,
    height: meta.height ?? null,
    bytes,
    file: `assets/${relFromAssets}`,
    thumb: thumbRel,
    license: DEFAULT_LICENSE
  };

  return item;
}

/**
 * ディレクトリを走査して画像ファイルを処理
 */
export async function processImages(assetsDir, validExtensions, slugGenerator) {
  const items = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (validExtensions.has(ext)) {
          const item = await processImage(fullPath, slugGenerator);
          items.push(item);
          console.log(`Processed: ${item.title} (${item.category})`);
        }
      }
    }
  }
  
  await walkDir(assetsDir);
  return items;
}
