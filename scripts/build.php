<?php
/**
 * PHPビルドシステム - メインスクリプト
 * フリー画像素材サイトのビルド処理
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Utils.php';
require_once __DIR__ . '/ImageProcessor.php';
require_once __DIR__ . '/HtmlGenerator.php';
require_once __DIR__ . '/SitemapGenerator.php';

class Builder
{
    private $config;
    private $slugGenerator;
    
    public function __construct()
    {
        $this->config = new Config();
        $this->slugGenerator = new SlugGenerator();
    }
    
    /**
     * メインビルド処理
     */
    public function build()
    {
        echo "Starting PHP build process...\n";
        
        try {
            // 初期設定
            $this->setupDirectories();
            
            // 画像処理
            echo "Processing images...\n";
            $imageProcessor = new ImageProcessor($this->config, $this->slugGenerator);
            $items = $imageProcessor->processImages();
            
            // 詳細ページ生成
            echo "Generating detail pages...\n";
            $htmlGenerator = new HtmlGenerator($this->config);
            foreach ($items as $item) {
                $htmlGenerator->writeDetailPage($item);
            }
            
            // assets.json出力
            echo "Generating assets.json...\n";
            $this->generateAssetsJson($items);
            
            // sitemap.xml生成
            echo "Generating sitemap.xml...\n";
            $sitemapGenerator = new SitemapGenerator($this->config);
            $sitemapGenerator->generateSitemap($items);
            
            echo "=== Build Complete ===\n";
            echo "Generated " . count($items) . " items + detail pages + sitemap.xml + assets.json\n";
            
            $categories = array_unique(array_column($items, 'category'));
            echo "Categories: " . count($categories) . "\n";
            
        } catch (Exception $e) {
            echo "Build failed: " . $e->getMessage() . "\n";
            exit(1);
        }
    }
    
    /**
     * ディレクトリセットアップ
     */
    private function setupDirectories()
    {
        // .nojekyllファイル作成
        file_put_contents($this->config->getRoot() . '/.nojekyll', '');
        
        // 必要なディレクトリ作成
        Utils::ensureDir($this->config->getAssetsDir());
        Utils::ensureDir($this->config->getThumbsDir());
        Utils::ensureDir($this->config->getItemsDir());
    }
    
    /**
     * assets.json生成
     */
    private function generateAssetsJson($items)
    {
        // パスの正規化（バックスラッシュをスラッシュに変換）
        $normalizedItems = array_map(function($item) {
            $item['originalPath'] = str_replace('\\', '/', $item['originalPath']);
            $item['thumbnailPath'] = str_replace('\\', '/', $item['thumbnailPath']);
            return $item;
        }, $items);
        
        $payload = [
            'updatedAt' => date('c'),
            'items' => $normalizedItems
        ];
        
        file_put_contents(
            $this->config->getOutJson(),
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }
}

// スクリプト実行
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    // 並列処理が利用可能かチェック
    if (function_exists('proc_open')) {
        echo "Parallel processing available, using build-parallel.php...\n";
        $parallelScript = __DIR__ . '/build-parallel.php';
        if (file_exists($parallelScript)) {
            include $parallelScript;
            exit(0);
        }
    }
    
    echo "Using single-threaded processing...\n";
    $builder = new Builder();
    $builder->build();
}
