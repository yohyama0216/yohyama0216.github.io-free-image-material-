<?php
/**
 * 設定クラス
 */
class Config
{
    private $root;
    private $assetsDir;
    private $thumbsDir;
    private $itemsDir;
    private $outJson;
    private $outSitemap;
    private $validExtensions;
    
    public function __construct()
    {
        $this->root = getcwd();
        $this->assetsDir = $this->root . '/assets';
        $this->thumbsDir = $this->assetsDir . '/_thumbs';
        $this->itemsDir = $this->root . '/items';
        $this->outJson = $this->root . '/assets.json';
        $this->outSitemap = $this->root . '/sitemap.xml';
        $this->validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    }
    
    public function getRoot() { return $this->root; }
    public function getAssetsDir() { return $this->assetsDir; }
    public function getThumbsDir() { return $this->thumbsDir; }
    public function getItemsDir() { return $this->itemsDir; }
    public function getOutJson() { return $this->outJson; }
    public function getOutSitemap() { return $this->outSitemap; }
    public function getValidExtensions() { return $this->validExtensions; }
    
    public function getThumbnailWidth() { return 480; }
    public function getThumbnailQuality() { return 80; }
    public function getDefaultLicense() { return 'CC0-1.0'; }
}
