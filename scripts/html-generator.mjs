// scripts/html-generator.mjs
import fs from "fs/promises";
import path from "path";
import { ITEMS_DIR } from "./config.mjs";
import { ensureDir } from "./utils.mjs";

/**
 * 詳細ページテンプレートを読み込んで変換
 */
async function loadDetailTemplate() {
  try {
    const templatePath = path.join(process.cwd(), "detail.html");
    return await fs.readFile(templatePath, "utf-8");
  } catch (error) {
    console.error("Failed to load detail.html template:", error);
    // フォールバック用の簡単なテンプレート
    return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>{{title}} - やまさんのフリー素材屋</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-4">
    <h1>{{title}}</h1>
    <img src="../../{{originalPath}}" alt="{{title}}" class="img-fluid">
    <p>Category: {{category}}</p>
    <p>Tags: {{tags}}</p>
    <a href="../../{{originalPath}}" download="{{filename}}" class="btn btn-primary">Download</a>
  </div>
</body>
</html>`;
  }
}

/**
 * テンプレート変数を置換
 */
function replaceTemplateVariables(template, item) {
  let html = template;
  
  // 基本的な変数を置換
  const variables = {
    title: item.title || "Untitled",
    category: item.category || "Unknown",
    slug: item.slug || "unknown",
    width: item.width || "?",
    height: item.height || "?",
    format: path.extname(item.originalPath).slice(1).toUpperCase() || "?",
    license: item.license || "CC0",
    filename: path.basename(item.originalPath) || "download",
    originalPath: item.originalPath || "",
    thumb: item.thumb || "",
    tags: (item.tags || []).join(","),
    description: item.description || ""
  };
  
  // 単純な変数置換
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, value);
  }
  
  // タグのループ処理（Handlebars的な構文をシンプルに処理）
  const tagPattern = /{{#each tags}}(.*?){{\/each}}/gs;
  html = html.replace(tagPattern, (match, content) => {
    if (!item.tags || item.tags.length === 0) return "";
    
    return item.tags.map(tag => {
      return content.replace(/{{this}}/g, tag);
    }).join("");
  });
  
  // 条件分岐処理
  const ifPattern = /{{#if description}}(.*?){{\/if}}/gs;
  html = html.replace(ifPattern, (match, content) => {
    return item.description ? content : "";
  });
  
  return html;
}

/**
 * 詳細ページのHTMLを生成
 */
export async function generateDetailHTML(item) {
  const template = await loadDetailTemplate();
  return replaceTemplateVariables(template, item);
}

/**
 * 詳細ページのHTMLファイルを書き出し
 */
export async function writeDetailPage(item) {
  const dir = path.join(ITEMS_DIR, item.slug);
  await ensureDir(dir);
  
  const htmlContent = await generateDetailHTML(item);
  await fs.writeFile(path.join(dir, "index.html"), htmlContent);
}
