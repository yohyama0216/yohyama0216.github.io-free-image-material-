<?php
/**
 * 並列処理テストスクリプト
 * 少数の画像で並列処理をテスト
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Utils.php';

class ParallelTest
{
    private $config;
    
    public function __construct()
    {
        $this->config = new Config();
    }
    
    public function runTest()
    {
        echo "=== Parallel Processing Test ===\n";
        
        // 画像ファイル数をカウント
        $imageCount = $this->countImageFiles();
        echo "Total images found: {$imageCount}\n";
        
        if ($imageCount === 0) {
            echo "No images found to process. Please add some images to the assets directory.\n";
            return;
        }
        
        // 並列処理のテスト実行
        echo "Testing parallel processing with 4 workers...\n";
        
        $startTime = microtime(true);
        
        // 並列ビルドスクリプトを実行
        $cmd = "php \"" . __DIR__ . "/build-parallel.php\"";
        echo "Executing: {$cmd}\n";
        
        $output = [];
        $returnVar = 0;
        exec($cmd, $output, $returnVar);
        
        $endTime = microtime(true);
        $totalTime = $endTime - $startTime;
        
        echo "\n=== Test Results ===\n";
        echo "Return code: {$returnVar}\n";
        echo "Total processing time: " . number_format($totalTime, 2) . " seconds\n";
        echo "Average time per image: " . number_format($totalTime / max(1, $imageCount), 2) . " seconds\n";
        echo "Estimated time for 5000 images: " . number_format(($totalTime / max(1, $imageCount)) * 5000 / 60, 1) . " minutes\n";
        
        echo "\nBuild output:\n";
        foreach ($output as $line) {
            echo $line . "\n";
        }
        
        if ($returnVar === 0) {
            echo "\n✅ Parallel processing test completed successfully!\n";
        } else {
            echo "\n❌ Parallel processing test failed!\n";
        }
    }
    
    private function countImageFiles()
    {
        $count = 0;
        $assetsDir = $this->config->getAssetsDir();
        
        if (!is_dir($assetsDir)) {
            return 0;
        }
        
        Utils::walkDirectory($assetsDir, function($filePath) use (&$count) {
            if (strpos($filePath, '_thumbs') !== false) {
                return;
            }
            
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            if (in_array('.' . $extension, $this->config->getValidExtensions())) {
                $count++;
            }
        });
        
        return $count;
    }
}

// スクリプト実行
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $test = new ParallelTest();
    $test->runTest();
}
