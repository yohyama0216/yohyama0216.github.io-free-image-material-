<?php
/**
 * 並列処理用 - 画像チャンク処理スクリプト
 * 引数: チャンクインデックス (1-4)
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Utils.php';
require_once __DIR__ . '/ImageProcessor.php';

class ChunkProcessor
{
    private $config;
    private $slugGenerator;
    private $chunkIndex;
    private $totalChunks;
    
    public function __construct($chunkIndex, $totalChunks = 4)
    {
        $this->config = new Config();
        $this->slugGenerator = new SlugGenerator();
        $this->chunkIndex = $chunkIndex;
        $this->totalChunks = $totalChunks;
    }
    
    /**
     * 指定されたチャンクの画像を処理
     */
    public function processChunk()
    {
        echo "Starting chunk processor {$this->chunkIndex}/{$this->totalChunks}...\n";
        
        // 全画像ファイルを取得
        $allImageFiles = $this->getAllImageFiles();
        
        // チャンクに分割
        $chunkSize = ceil(count($allImageFiles) / $this->totalChunks);
        $startIndex = ($this->chunkIndex - 1) * $chunkSize;
        $endIndex = min($startIndex + $chunkSize, count($allImageFiles));
        
        $chunkFiles = array_slice($allImageFiles, $startIndex, $endIndex - $startIndex);
        
        echo "Processing " . count($chunkFiles) . " images in chunk {$this->chunkIndex}...\n";
        
        // 画像処理
        $imageProcessor = new ImageProcessor($this->config, $this->slugGenerator);
        $items = [];
        
        foreach ($chunkFiles as $index => $filePath) {
            echo "Chunk {$this->chunkIndex}: Processing " . ($index + 1) . "/" . count($chunkFiles) . " - " . basename($filePath) . "\n";
            $imageProcessor->processImageFile($filePath, $items);
        }
        
        // チャンク結果をJSONファイルに保存
        $chunkOutputFile = $this->config->getRoot() . "/chunk_{$this->chunkIndex}.json";
        file_put_contents($chunkOutputFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        echo "Chunk {$this->chunkIndex} complete: " . count($items) . " items processed\n";
        
        return $items;
    }
    
    /**
     * 全画像ファイルのパスを取得
     */
    private function getAllImageFiles()
    {
        $imageFiles = [];
        $assetsDir = $this->config->getAssetsDir();
        
        Utils::walkDirectory($assetsDir, function($filePath) use (&$imageFiles) {
            // _thumbsディレクトリは除外
            if (strpos($filePath, '_thumbs') !== false) {
                return;
            }
            
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            if (in_array('.' . $extension, $this->config->getValidExtensions())) {
                $imageFiles[] = $filePath;
            }
        });
        
        return $imageFiles;
    }
}

// スクリプト実行
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    if ($argc < 2) {
        echo "Usage: php process-chunk.php <chunk_index>\n";
        echo "Example: php process-chunk.php 1\n";
        exit(1);
    }
    
    $chunkIndex = intval($argv[1]);
    if ($chunkIndex < 1 || $chunkIndex > 4) {
        echo "Chunk index must be between 1 and 4\n";
        exit(1);
    }
    
    $processor = new ChunkProcessor($chunkIndex);
    $processor->processChunk();
}
