<?php
/**
 * サイトマップ生成クラス
 */
class SitemapGenerator
{
    private $config;
    
    public function __construct($config)
    {
        $this->config = $config;
    }
    
    /**
     * サイトマップ生成
     */
    public function generateSitemap($items)
    {
        $routes = $this->generateRoutes($items);
        $xml = $this->generateSitemapXML($routes);
        
        file_put_contents($this->config->getOutSitemap(), $xml);
        
        echo "Total routes in sitemap: " . count($routes) . "\n";
    }
    
    /**
     * ルート生成
     */
    private function generateRoutes($items)
    {
        $baseUrl = $this->getBaseUrl();
        $routes = [];
        
        // ホームページ
        $routes[] = [
            'url' => $baseUrl,
            'lastmod' => date('c'),
            'priority' => '1.0'
        ];
        
        // タグページ
        $routes[] = [
            'url' => $baseUrl . '/tags.html',
            'lastmod' => date('c'),
            'priority' => '0.8'
        ];
        
        // カテゴリページ
        $categories = array_unique(array_column($items, 'category'));
        foreach ($categories as $category) {
            $routes[] = [
                'url' => $baseUrl . '/?category=' . urlencode($category),
                'lastmod' => date('c'),
                'priority' => '0.7'
            ];
        }
        
        // タグページ
        $allTags = [];
        foreach ($items as $item) {
            $allTags = array_merge($allTags, $item['tags']);
        }
        $uniqueTags = array_unique($allTags);
        
        foreach ($uniqueTags as $tag) {
            $routes[] = [
                'url' => $baseUrl . '/?tag=' . urlencode($tag),
                'lastmod' => date('c'),
                'priority' => '0.6'
            ];
        }
        
        // 詳細ページ
        foreach ($items as $item) {
            $routes[] = [
                'url' => $baseUrl . '/items/' . $item['slug'] . '/',
                'lastmod' => $item['updatedAt'],
                'priority' => '0.9'
            ];
        }
        
        return $routes;
    }
    
    /**
     * サイトマップXML生成
     */
    private function generateSitemapXML($routes)
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        
        foreach ($routes as $route) {
            $xml .= '  <url>' . "\n";
            $xml .= '    <loc>' . htmlspecialchars($route['url'], ENT_XML1, 'UTF-8') . '</loc>' . "\n";
            $xml .= '    <lastmod>' . $route['lastmod'] . '</lastmod>' . "\n";
            $xml .= '    <priority>' . $route['priority'] . '</priority>' . "\n";
            $xml .= '  </url>' . "\n";
        }
        
        $xml .= '</urlset>' . "\n";
        
        return $xml;
    }
    
    /**
     * ベースURL取得
     */
    private function getBaseUrl()
    {
        // GitHub Pagesのリポジトリ名に対応
        return 'https://yohyama0216.github.io/yohyama0216.github.io-free-image-material-';
    }
}
