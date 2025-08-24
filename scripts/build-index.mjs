// scripts/build-index.mjs
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "assets");
const THUMBS_DIR = path.join(ASSETS_DIR, "_thumbs");
const ITEMS_DIR = path.join(ROOT, "items");        // 詳細ページ出力先
const OUT_JSON = path.join(ROOT, "assets.json");
const OUT_SITEMAP = path.join(ROOT, "sitemap.xml");

const validExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const items = [];
const slugCounter = new Map(); // 重複スラグ避け

// ---------- ユーティリティ ----------
const toSlug = (s) => s.toLowerCase()
  .replace(/[^a-z0-9\-_.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

function uniqueSlug(base) {
  if (!slugCounter.has(base)) { slugCounter.set(base, 0); return base; }
  const n = slugCounter.get(base) + 1;
  slugCounter.set(base, n);
  return `${base}-${n}`;
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

function html(strings, ...vals){ return strings.map((s,i)=>s+(vals[i]??"")).join(""); }

// ---------- メイン処理 ----------
async function walk(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full);
    else {
      const ext = path.extname(ent.name).toLowerCase();
      if (validExt.has(ext)) await handleImage(full);
    }
  }
}

async function handleImage(fullPath) {
  const relFromAssets = path.relative(ASSETS_DIR, fullPath).split(path.sep).join("/");
  const base = path.parse(relFromAssets).name;              // 拡張子除くファイル名
  const title = base.replace(/[-_]+/g, " ").trim();
  const parts = relFromAssets.split("/");                   // ["category", ... , "file.png"]
  const category = parts[0] || "misc";
  const tags = Array.from(new Set(parts.slice(0, -1).filter(Boolean)));

  // スラグ（カテゴリ + ファイル名）
  const slugBase = toSlug(`${category}-${base}`);
  const slug = uniqueSlug(slugBase);

  // メタ情報 + サムネ作成
  const img = sharp(fullPath);
  const meta = await img.metadata();

  const thumbRelDir = path.join("_thumbs", path.dirname(relFromAssets)).split(path.sep).join("/");
  const thumbFile = `${base}-480.jpg`;
  const thumbRel = `assets/${thumbRelDir}/${thumbFile}`;
  const thumbAbsDir = path.join(THUMBS_DIR, path.dirname(relFromAssets));
  await ensureDir(thumbAbsDir);
  await img.resize({ width: 480, withoutEnlargement: true }).jpeg({ quality: 80 })
          .toFile(path.join(thumbAbsDir, thumbFile));

  // ファイルサイズ（KB/MB表示用）
  const st = await fs.stat(fullPath);
  const bytes = st.size;

  const item = {
    id: base,
    slug,                 // ← 詳細ページのパスに使う
    title,
    category,
    tags,
    width: meta.width ?? null,
    height: meta.height ?? null,
    bytes,
    file: `assets/${relFromAssets}`,   // オリジナル
    thumb: thumbRel,                   // サムネ
    license: "CC0-1.0"
  };
  items.push(item);

  // 詳細HTMLを出力（items/<slug>/index.html）
  await writeDetailPage(item);
}

function fmtSize(bytes){
  if (bytes >= 1024*1024) return (bytes/(1024*1024)).toFixed(2)+" MB";
  if (bytes >= 1024) return (bytes/1024).toFixed(0)+" KB";
  return bytes+" B";
}

async function writeDetailPage(it){
  // items/<slug>/index.html（常に深さ2階層なので、assets などは ../../ で参照）
  const dir = path.join(ITEMS_DIR, it.slug);
  await ensureDir(dir);

  const head = html`
<!doctype html>
<html lang="ja"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${it.title} | Free Game Materials</title>
  <meta name="description" content="${it.category} / ${it.tags.join(", ")} のフリー素材">
  <meta property="og:title" content="${it.title}">
  <meta property="og:description" content="${it.category} · ${it.tags.join(", ")} · ${it.width}×${it.height}">
  <meta property="og:image" content="../../${it.thumb}">
  <link rel="icon" href="data:," />
  <style>
    body{margin:0;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;background:#fff;color:#111}
    header,footer{border-bottom:1px solid #eee}
    .wrap{max-width:1000px;margin:auto;padding:16px}
    h1{font-size:22px;margin:0}
    .breadcrumbs a{color:#06f;text-decoration:none}
    .grid{display:grid;grid-template-columns: 1fr 320px;gap:24px}
    .hero{width:100%;border:1px solid #eee;border-radius:12px;overflow:hidden}
    .hero img{width:100%;display:block}
    .box{border:1px solid #eee;border-radius:12px;padding:12px}
    .btn{display:inline-block;padding:10px 14px;border:1px solid #ddd;border-radius:10px;text-decoration:none}
    .btn.primary{border-color:#333}
    .meta small{color:#666}
  </style>
</head><body>
<header><div class="wrap">
  <div class="breadcrumbs">
    <a href="../../index.html">← 一覧へ戻る</a>
  </div>
  <h1>${it.title}</h1>
</div></header>
<main><div class="wrap"><div class="grid">
  <div>
    <div class="hero"><img src="../../${it.file}" alt="${it.title}" loading="eager"></div>
  </div>
  <aside>
    <div class="box meta">
      <p><strong>カテゴリ:</strong> ${it.category}<br>
         <strong>タグ:</strong> ${it.tags.join(", ") || "-"}</p>
      <p><strong>解像度:</strong> ${it.width || "?"}×${it.height || "?"}<br>
         <strong>サイズ:</strong> ${fmtSize(it.bytes)}<br>
         <strong>ライセンス:</strong> ${it.license}</p>
      <p>
        <a class="btn primary" href="../../${it.file}" download>ダウンロード</a>
        <a class="btn" href="../../${it.file}" target="_blank" rel="noopener">原寸で開く</a>
      </p>
    </div>
  </aside>
</div></div></main>
<footer><div class="wrap">
  <small>© 2025 Free Game Materials · ライセンスは各素材の表記に従います。</small>
</div></footer>
</body></html>`;

  await fs.writeFile(path.join(dir, "index.html"), head);
}

function buildSitemapXML(baseUrl, routes) {
  const urlset = routes.map(u => `  <url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>\n`;
}

(async () => {
  // _thumbs配信のため
  await fs.writeFile(path.join(ROOT, ".nojekyll"), "");

  await ensureDir(ASSETS_DIR);
  await ensureDir(ITEMS_DIR);

  await walk(ASSETS_DIR);

  // JSON 出力（一覧ページ用）
  const payload = { updatedAt: new Date().toISOString(), items };
  await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));

  // sitemap.xml（トップ + 各オリジナル + 各詳細ページ）
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "owner/repo").split("/");
  const baseUrl = `https://${owner}.github.io/${repo}/`;
  const routes = new Set([`${baseUrl}`, `${baseUrl}index.html`]);
  for (const it of items) {
    routes.add(`${baseUrl}${it.file}`);
    routes.add(`${baseUrl}items/${it.slug}/`);
  }
  await fs.writeFile(OUT_SITEMAP, buildSitemapXML(baseUrl, Array.from(routes)));

  console.log(`Generated ${items.length} items + detail pages + sitemap.xml + assets.json`);
})().catch(e => { console.error(e); process.exit(1); });
