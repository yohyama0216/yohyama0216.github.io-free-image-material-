import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "assets");
const THUMBS_DIR = path.join(ASSETS_DIR, "_thumbs");
const OUT_JSON = path.join(ROOT, "assets.json");
const OUT_SITEMAP = path.join(ROOT, "sitemap.xml");

const validExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const items = [];

/** 再帰で assets/ を走査 */
async function walk(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await walk(full);
    } else {
      const ext = path.extname(ent.name).toLowerCase();
      if (validExt.has(ext)) await handleImage(full);
    }
  }
}

/** 1枚処理：サムネ作成 + メタ情報抽出 */
async function handleImage(fullPath) {
  const relFromAssets = path.relative(ASSETS_DIR, fullPath).split(path.sep).join("/");
  const base = path.parse(relFromAssets).name;
  const title = base.replace(/[-_]+/g, " ").trim();
  const parts = relFromAssets.split("/"); // ["category", "sub", "file.png"]
  const category = parts[0] || "misc";
  const tags = Array.from(new Set(parts.slice(0, -1).filter(Boolean)));

  // メタ情報
  const img = sharp(fullPath);
  const meta = await img.metadata();

  // サムネ（幅480, jpg）
  const thumbRelDir = path.join("_thumbs", path.dirname(relFromAssets)).split(path.sep).join("/");
  const thumbFile = `${base}-480.jpg`;
  const thumbRel = `assets/${thumbRelDir}/${thumbFile}`;
  const thumbAbsDir = path.join(THUMBS_DIR, path.dirname(relFromAssets));
  await fs.mkdir(thumbAbsDir, { recursive: true });
  await img.resize({ width: 480, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(thumbAbsDir, thumbFile));

  items.push({
    id: base,
    title,
    category,
    tags,
    width: meta.width ?? null,
    height: meta.height ?? null,
    file: `assets/${relFromAssets}`,  // オリジナル
    thumb: thumbRel,                  // サムネ
    license: "CC0-1.0"                // 必要に応じて変更
  });
}

/** sitemap.xml 生成（プロジェクトサイトURLを推定） */
function buildSitemapXML(baseUrl, routes) {
  const urlset = routes.map(u => `  <url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>\n`;
}

(async () => {
  // .nojekyll を確実に置く（_thumbs を配信するため）
  await fs.writeFile(path.join(ROOT, ".nojekyll"), "");

  // assets 配下を走査
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  await walk(ASSETS_DIR);

  // JSON 出力
  const payload = { updatedAt: new Date().toISOString(), items };
  await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));

  // sitemap.xml 出力（index + 各オリジナル画像）
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "owner/repo").split("/");
  const baseUrl = `https://${owner}.github.io/${repo}/`;
  const routes = new Set([`${baseUrl}`, `${baseUrl}index.html`]);
  for (const it of items) routes.add(`${baseUrl}${it.file}`);
  await fs.writeFile(OUT_SITEMAP, buildSitemapXML(baseUrl, Array.from(routes)));

  console.log(`Generated ${items.length} items, sitemap.xml, assets.json`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
