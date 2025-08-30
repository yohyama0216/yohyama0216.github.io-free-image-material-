<?php
/**
 * ユーティリティクラス
 */
class Utils
{
    /**
     * ディレクトリを再帰的に作成
     */
    public static function ensureDir($dirPath)
    {
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0755, true);
        }
    }
    
    /**
     * 文字列をスラグに変換
     */
    public static function toSlug($string)
    {
        $slug = strtolower($string);
        $slug = preg_replace('/[^a-z0-9\-_.]+/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }
    
    /**
     * ファイルサイズを読みやすい形式に変換
     */
    public static function formatSize($bytes)
    {
        if ($bytes >= 1024 * 1024) {
            return number_format($bytes / (1024 * 1024), 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 0) . ' KB';
        }
        return $bytes . ' B';
    }
    
    /**
     * ディレクトリを再帰的に走査
     */
    public static function walkDirectory($dir, $callback)
    {
        if (!is_dir($dir)) {
            return;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $callback($file->getPathname());
            }
        }
    }
    
    /**
     * 画像の基本情報を取得
     */
    public static function getImageInfo($imagePath)
    {
        if (!file_exists($imagePath)) {
            return false;
        }
        
        $info = getimagesize($imagePath);
        if ($info === false) {
            return false;
        }
        
        return [
            'width' => $info[0],
            'height' => $info[1],
            'type' => $info[2],
            'mime' => $info['mime']
        ];
    }
}

/**
 * 重複しないスラグを生成するクラス
 */
class SlugGenerator
{
    private $counter = [];
    
    public function generate($base)
    {
        if (!isset($this->counter[$base])) {
            $this->counter[$base] = 0;
            return $base;
        }
        
        $this->counter[$base]++;
        return $base . '-' . $this->counter[$base];
    }
}
