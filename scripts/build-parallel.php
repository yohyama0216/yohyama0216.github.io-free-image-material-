<?php
/**
 * 並列処理対応ビルドシステム - メインスクリプト
 * 4並列で画像処理を実行
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Utils.php';
require_once __DIR__ . '/HtmlGenerator.php';
require_once __DIR__ . '/SitemapGenerator.php';

class ParallelBuilder
{
    private $config;
    private $slugGenerator;
    
    public function __construct()
    {
        $this->config = new Config();
        $this->slugGenerator = new SlugGenerator();
    }
    
    /**
     * 並列ビルド処理メイン
     */
    public function build()
    {
        echo "Starting Parallel PHP build process...\n";
        
        try {
            // 初期設定
            $this->setupDirectories();
            
            // 並列画像処理
            echo "Processing images in parallel (4 processes)...\n";
            $items = $this->processImagesParallel();
            
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
            
            // 一時ファイルクリーンアップ
            $this->cleanupTempFiles();
            
            echo "=== Parallel Build Complete ===\n";
            echo "Generated " . count($items) . " items + detail pages + sitemap.xml + assets.json\n";
            
            $categories = array_unique(array_column($items, 'category'));
            echo "Categories: " . count($categories) . "\n";
            
        } catch (Exception $e) {
            echo "Build failed: " . $e->getMessage() . "\n";
            exit(1);
        }
    }
    
    /**
     * 並列画像処理
     */
    private function processImagesParallel()
    {
        $totalChunks = 4;
        $processes = [];
        $startTime = microtime(true);
        
        echo "Starting {$totalChunks} parallel processes...\n";
        
        // 4つの並列プロセスを開始
        for ($i = 1; $i <= $totalChunks; $i++) {
            $cmd = "php \"" . __DIR__ . "/process-chunk.php\" {$i}";
            
            $descriptorspec = [
                0 => ["pipe", "r"],  // stdin
                1 => ["pipe", "w"],  // stdout
                2 => ["pipe", "w"]   // stderr
            ];
            
            $process = proc_open($cmd, $descriptorspec, $pipes);
            
            if (is_resource($process)) {
                $processes[$i] = [
                    'process' => $process,
                    'pipes' => $pipes
                ];
                echo "Started chunk processor {$i}\n";
            } else {
                throw new Exception("Failed to start chunk processor {$i}");
            }
        }
        
        // すべてのプロセスの完了を待機
        echo "Waiting for all processes to complete...\n";
        $allItems = [];
        
        foreach ($processes as $chunkIndex => $processData) {
            $process = $processData['process'];
            $pipes = $processData['pipes'];
            
            // プロセスの出力を読み取り
            $stdout = stream_get_contents($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            
            // パイプをクローズ
            fclose($pipes[0]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            
            // プロセス終了を待機
            $returnValue = proc_close($process);
            
            if ($returnValue !== 0) {
                echo "Chunk {$chunkIndex} stderr: {$stderr}\n";
                throw new Exception("Chunk processor {$chunkIndex} failed with return code {$returnValue}");
            }
            
            echo "Chunk {$chunkIndex} output:\n{$stdout}\n";
            
            // チャンク結果を読み込み
            $chunkFile = $this->config->getRoot() . "/chunk_{$chunkIndex}.json";
            if (file_exists($chunkFile)) {
                $chunkItems = json_decode(file_get_contents($chunkFile), true);
                if ($chunkItems) {
                    $allItems = array_merge($allItems, $chunkItems);
                    echo "Loaded " . count($chunkItems) . " items from chunk {$chunkIndex}\n";
                }
            }
        }
        
        $endTime = microtime(true);
        $processingTime = $endTime - $startTime;
        
        echo "Parallel processing completed in " . number_format($processingTime, 2) . " seconds\n";
        echo "Total items processed: " . count($allItems) . "\n";
        
        return $allItems;
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
    
    /**
     * 一時ファイルクリーンアップ
     */
    private function cleanupTempFiles()
    {
        $root = $this->config->getRoot();
        for ($i = 1; $i <= 4; $i++) {
            $chunkFile = $root . "/chunk_{$i}.json";
            if (file_exists($chunkFile)) {
                unlink($chunkFile);
            }
        }
    }
}

// スクリプト実行
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $builder = new ParallelBuilder();
    $builder->build();
}
