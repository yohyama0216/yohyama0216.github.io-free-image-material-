// scripts/html-generator.mjs
import fs from "fs/promises";
import path from "path";
import { ITEMS_DIR } from "./config.mjs";
import { ensureDir, formatSize, html } from "./utils.mjs";

/**
 * 詳細ページのHTMLを生成
 */
export function generateDetailHTML(item) {
  return html`
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${item.title} | Free Game Materials</title>
  <meta name="description" content="${item.category} カテゴリの ${item.title}. ${item.tags.join(", ")} などのタグが付いたフリー素材です。商用利用可能。">
  <meta name="keywords" content="${[item.category, item.title, ...item.tags].join(",")},フリー素材,ゲーム素材,無料,商用利用可能">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${item.title} | Free Game Materials">
  <meta property="og:description" content="${item.category} · ${item.tags.join(", ")} · ${item.width || "?"}×${item.height || "?"}">
  <meta property="og:image" content="../../${item.thumb}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${item.title} | Free Game Materials">
  <meta name="twitter:description" content="${item.category} · ${item.tags.join(", ")} · ${item.width || "?"}×${item.height || "?"}">
  <meta name="twitter:image" content="../../${item.thumb}">
  
  <link rel="icon" href="data:," />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .hero-image { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .meta-card { background: #f8f9fa; border-radius: 12px; padding: 20px; }
    .download-btn { background: #007bff; border: none; }
    .download-btn:hover { background: #0056b3; }
  </style>
</head>
<body>
<div class="container mt-4">
  <!-- Breadcrumb -->
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="../../index.html">ホーム</a></li>
      <li class="breadcrumb-item"><a href="../../index.html#category=${encodeURIComponent(item.category)}">${item.category}</a></li>
      <li class="breadcrumb-item active" aria-current="page">${item.title}</li>
    </ol>
  </nav>

  <div class="row">
    <div class="col-lg-8">
      <!-- メイン画像 -->
      <div class="text-center mb-4">
        <img src="../../${item.file}" alt="${item.title}" class="hero-image" loading="eager">
      </div>
      
      <!-- タイトルと説明 -->
      <h1 class="h2 mb-3">${item.title}</h1>
      <p class="text-muted mb-4">
        このフリー素材は${item.category}カテゴリに分類されており、
        ${item.tags.join("、")}などのタグが付けられています。
        商用・非商用を問わず自由にご利用いただけます。
      </p>
    </div>
    
    <div class="col-lg-4">
      <!-- メタ情報 -->
      <div class="meta-card mb-4">
        <h3 class="h5 mb-3">素材情報</h3>
        <table class="table table-sm table-borderless">
          <tr><td><strong>カテゴリ:</strong></td><td>${item.category}</td></tr>
          <tr><td><strong>タグ:</strong></td><td>${item.tags.join(", ") || "-"}</td></tr>
          <tr><td><strong>解像度:</strong></td><td>${item.width || "?"}×${item.height || "?"}</td></tr>
          <tr><td><strong>ファイルサイズ:</strong></td><td>${formatSize(item.bytes)}</td></tr>
          <tr><td><strong>ライセンス:</strong></td><td>${item.license}</td></tr>
        </table>
        
        <!-- ダウンロードボタン -->
        <div class="d-grid gap-2">
          <a class="btn btn-primary download-btn" href="../../${item.file}" download>
            ダウンロード
          </a>
          <a class="btn btn-outline-secondary" href="../../${item.file}" target="_blank" rel="noopener">
            原寸で表示
          </a>
        </div>
      </div>
      
      <!-- ライセンス情報 -->
      <div class="alert alert-info">
        <h6><strong>ライセンスについて</strong></h6>
        <small>
          この素材は ${item.license} ライセンスで提供されています。
          商用・非商用を問わず自由にご利用いただけます。
        </small>
      </div>
    </div>
  </div>
</div>

<footer class="border-top mt-5 py-3">
  <div class="container">
    <div class="text-center text-muted">
      <small>© 2025 Free Game Materials · ライセンスは各素材の表記に従います。</small>
    </div>
  </div>
</footer>
</body>
</html>`;
}

/**
 * 詳細ページのHTMLファイルを書き出し
 */
export async function writeDetailPage(item) {
  const dir = path.join(ITEMS_DIR, item.slug);
  await ensureDir(dir);
  
  const htmlContent = generateDetailHTML(item);
  await fs.writeFile(path.join(dir, "index.html"), htmlContent);
}
