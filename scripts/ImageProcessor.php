<?php
/**
 * 画像処理クラス
 */
class ImageProcessor
{
    private $config;
    private $slugGenerator;
    
    public function __construct($config, $slugGenerator)
    {
        $this->config = $config;
        $this->slugGenerator = $slugGenerator;
    }
    
    /**
     * 画像処理メイン
     */
    public function processImages()
    {
        $items = [];
        $assetsDir = $this->config->getAssetsDir();
        
        // 画像ファイルのみを処理
        Utils::walkDirectory($assetsDir, function($filePath) use (&$items) {
            // _thumbsディレクトリは除外
            if (strpos($filePath, '_thumbs') !== false) {
                return;
            }
            
            $this->processImage($filePath, $items);
        });
        
        return $items;
    }
    
    /**
     * 個別画像処理（公開メソッド）
     */
    public function processImageFile($filePath, &$items)
    {
        $this->processImage($filePath, $items);
    }
    
    /**
     * 個別画像処理
     */
    private function processImage($filePath, &$items)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        // 有効な拡張子かチェック
        if (!in_array('.' . $extension, $this->config->getValidExtensions())) {
            return;
        }
        
        // サムネイルディレクトリは除外
        if (strpos($filePath, '_thumbs') !== false) {
            return;
        }
        
        // 画像情報取得
        $imageInfo = Utils::getImageInfo($filePath);
        if (!$imageInfo) {
            echo "Skipped invalid image: $filePath\n";
            return;
        }
        
        // パス情報の正規化
        $assetsDir = realpath($this->config->getAssetsDir());
        $realFilePath = realpath($filePath);
        
        // assets/以降の相対パスを取得
        $relativePath = 'assets/' . str_replace($assetsDir . DIRECTORY_SEPARATOR, '', $realFilePath);
        $relativePath = str_replace('\\', '/', $relativePath); // Windows対応
        
        $filename = pathinfo($filePath, PATHINFO_FILENAME);
        $category = $this->getCategoryFromPath($filePath);
        
        // スラグ生成
        $baseSlug = Utils::toSlug($filename);
        $slug = $this->slugGenerator->generate($baseSlug);
        
        // サムネイル生成
        $thumbnailPath = $this->generateThumbnail($filePath, $filename);
        
        // メタデータ読み込み
        $metadata = $this->loadMetadata($filePath);
        
        // アイテム作成
        $item = [
            'id' => $slug,
            'title' => $metadata['title'] ?? $filename,
            'category' => $category,
            'tags' => $metadata['tags'] ?? [$category],
            'description' => $metadata['description'] ?? '',
            'license' => $metadata['license'] ?? $this->config->getDefaultLicense(),
            'originalPath' => $relativePath,
            'thumbnailPath' => $thumbnailPath,
            'width' => $imageInfo['width'],
            'height' => $imageInfo['height'],
            'fileSize' => filesize($filePath),
            'slug' => $slug,
            'createdAt' => date('c', filemtime($filePath)),
            'updatedAt' => date('c', filemtime($filePath))
        ];
        
        $items[] = $item;
        echo "Processed: $filename ($category)\n";
    }
    
    /**
     * パスからカテゴリを推定
     */
    private function getCategoryFromPath($filePath)
    {
        $assetsDir = $this->config->getAssetsDir();
        $relativePath = str_replace($assetsDir, '', $filePath);
        $parts = explode(DIRECTORY_SEPARATOR, trim($relativePath, DIRECTORY_SEPARATOR));
        
        return $parts[0] ?? 'other';
    }
    
    /**
     * サムネイル生成
     */
    private function generateThumbnail($originalPath, $filename)
    {
        $thumbsDir = $this->config->getThumbsDir();
        Utils::ensureDir($thumbsDir);
        
        $extension = pathinfo($originalPath, PATHINFO_EXTENSION);
        $thumbPath = $thumbsDir . DIRECTORY_SEPARATOR . $filename . '_thumb.' . $extension;
        $relativeThumbPath = 'assets/_thumbs/' . $filename . '_thumb.' . $extension;
        
        // 既にサムネイルが存在し、元画像より新しい場合はスキップ
        if (file_exists($thumbPath) && filemtime($thumbPath) >= filemtime($originalPath)) {
            return $relativeThumbPath;
        }
        
        // GDを使用してサムネイル生成
        $this->createThumbnailWithGD($originalPath, $thumbPath);
        
        return $relativeThumbPath;
    }
    
    /**
     * GDライブラリを使用したサムネイル生成
     */
    private function createThumbnailWithGD($source, $destination)
    {
        $imageInfo = getimagesize($source);
        if (!$imageInfo) {
            return false;
        }
        
        $sourceWidth = $imageInfo[0];
        $sourceHeight = $imageInfo[1];
        $sourceType = $imageInfo[2];
        
        // 元画像読み込み
        switch ($sourceType) {
            case IMAGETYPE_JPEG:
                $sourceImage = imagecreatefromjpeg($source);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = imagecreatefrompng($source);
                break;
            case IMAGETYPE_WEBP:
                $sourceImage = imagecreatefromwebp($source);
                break;
            default:
                return false;
        }
        
        if (!$sourceImage) {
            return false;
        }
        
        // サムネイルサイズ計算
        $thumbWidth = $this->config->getThumbnailWidth();
        $ratio = min($thumbWidth / $sourceWidth, $thumbWidth / $sourceHeight);
        $thumbHeight = intval($sourceHeight * $ratio);
        $thumbWidth = intval($sourceWidth * $ratio);
        
        // サムネイル画像作成
        $thumbImage = imagecreatetruecolor($thumbWidth, $thumbHeight);
        
        // PNG透明度対応
        if ($sourceType === IMAGETYPE_PNG) {
            imagealphablending($thumbImage, false);
            imagesavealpha($thumbImage, true);
            $transparent = imagecolorallocatealpha($thumbImage, 255, 255, 255, 127);
            imagefill($thumbImage, 0, 0, $transparent);
        }
        
        // リサイズ
        imagecopyresampled(
            $thumbImage, $sourceImage,
            0, 0, 0, 0,
            $thumbWidth, $thumbHeight,
            $sourceWidth, $sourceHeight
        );
        
        // 保存
        switch ($sourceType) {
            case IMAGETYPE_JPEG:
                imagejpeg($thumbImage, $destination, $this->config->getThumbnailQuality());
                break;
            case IMAGETYPE_PNG:
                imagepng($thumbImage, $destination);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($thumbImage, $destination, $this->config->getThumbnailQuality());
                break;
        }
        
        // メモリ解放
        imagedestroy($sourceImage);
        imagedestroy($thumbImage);
        
        return true;
    }
    
    /**
     * メタデータファイル読み込み
     */
    private function loadMetadata($imagePath)
    {
        $dir = dirname($imagePath);
        $metaPath = $dir . '/.meta.json';
        
        if (!file_exists($metaPath)) {
            return [];
        }
        
        $content = file_get_contents($metaPath);
        $allMeta = json_decode($content, true);
        
        if (!$allMeta) {
            return [];
        }
        
        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        return $allMeta[$filename] ?? [];
    }
}
