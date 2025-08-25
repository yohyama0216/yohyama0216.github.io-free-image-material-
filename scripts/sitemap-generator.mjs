// scripts/sitemap-generator.mjs

/**
 * サイトマップXMLを生成
 */
export function generateSitemapXML(baseUrl, routes) {
  const urlEntries = routes.map(url => `  <url><loc>${url}</loc></url>`).join("\n");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * アイテムリストからサイトマップのルートを生成
 */
export function generateRoutes(baseUrl, items) {
  const routes = new Set([
    baseUrl,
    `${baseUrl}index.html`
  ]);
  
  for (const item of items) {
    routes.add(`${baseUrl}${item.file}`);
    routes.add(`${baseUrl}items/${item.slug}/`);
  }
  
  return Array.from(routes);
}

/**
 * ベースURLを環境変数から生成
 */
export function getBaseUrl() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "owner/repo").split("/");
  return `https://${owner}.github.io/${repo}/`;
}
