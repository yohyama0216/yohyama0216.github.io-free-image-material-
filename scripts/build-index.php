<?php
/**
 * scripts/build-index.php
 * フリー画像素材サイトのビルドスクリプト（PHP版）
 * 
 * 使用方法: php scripts/build-index.php
 * 
 * 必要な拡張機能:
 * - GD または Imagick
 * - JSON
 */

// 設定
$ROOT = getcwd();
$ASSETS_DIR = $ROOT . DIRECTORY_SEPARATOR . 'assets';
$THUMBS_DIR = $ASSETS_DIR . DIRECTORY_SEPARATOR . '_thumbs';
$ITEMS_DIR = $ROOT . DIRECTORY_SEPARATOR . 'items';
$OUT_JSON = $ROOT . DIRECTORY_SEPARATOR . 'assets.json';
$OUT_SITEMAP = $ROOT . DIRECTORY_SEPARATOR . 'sitemap.xml';

$validExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
$items = [];
$slugCounter = [];

// ---------- ユーティリティ関数 ----------

/**
 * 文字列をスラグに変換
 */
function toSlug($s) {
    $s = strtolower($s);
    $s = preg_replace('/[^a-z0-9\-_.]+/', '-', $s);
    $s = preg_replace('/-+/', '-', $s);
    $s = trim($s, '-');
    return $s;
}

/**
 * 重複しないスラグを生成
 */
function uniqueSlug($base) {
    global $slugCounter;
    
    if (!isset($slugCounter[$base])) {
        $slugCounter[$base] = 0;
        return $base;
    }
    
    $slugCounter[$base]++;
    return $base . '-' . $slugCounter[$base];
}

/**
 * ディレクトリを再帰的に作成
 */
function ensureDir($path) {
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

/**
 * ファイルサイズを読みやすい形式に変換
 */
function formatSize($bytes) {
    if ($bytes >= 1024 * 1024) {
        return number_format($bytes / (1024 * 1024), 2) . ' MB';
    }
    if ($bytes >= 1024) {
        return number_format($bytes / 1024, 0) . ' KB';
    }
    return $bytes . ' B';
}

/**
 * ディレクトリを再帰的に走査
 */
function walkDirectory($dir, $callback) {
    if (!is_dir($dir)) return;
    
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
 * 画像ファイルを処理
 */
function handleImage($fullPath) {
    global $ASSETS_DIR, $THUMBS_DIR, $items;
    
    $relFromAssets = str_replace($ASSETS_DIR . DIRECTORY_SEPARATOR, '', $fullPath);
    $relFromAssets = str_replace(DIRECTORY_SEPARATOR, '/', $relFromAssets);
    
    $pathInfo = pathinfo($relFromAssets);
    $base = $pathInfo['filename'];
    $title = ucwords(str_replace(['-', '_'], ' ', $base));
    
    $parts = explode('/', $relFromAssets);
    $category = $parts[0] ?? 'misc';
    $tags = array_unique(array_filter(array_slice($parts, 0, -1)));
    
    // スラグ生成
    $slugBase = toSlug($category . '-' . $base);
    $slug = uniqueSlug($slugBase);
    
    // 画像情報取得
    $imageInfo = getimagesize($fullPath);
    $width = $imageInfo[0] ?? null;
    $height = $imageInfo[1] ?? null;
    $bytes = filesize($fullPath);
    
    // サムネイル作成
    $thumbRelDir = '_thumbs/' . dirname($relFromAssets);
    $thumbFile = $base . '-480.jpg';
    $thumbRel = 'assets/' . $thumbRelDir . '/' . $thumbFile;
    
    $thumbAbsDir = $THUMBS_DIR . DIRECTORY_SEPARATOR . dirname($relFromAssets);
    ensureDir($thumbAbsDir);
    
    createThumbnail($fullPath, $thumbAbsDir . DIRECTORY_SEPARATOR . $thumbFile, 480);
    
    $item = [
        'id' => $base,
        'slug' => $slug,
        'title' => $title,
        'category' => $category,
        'tags' => $tags,
        'width' => $width,
        'height' => $height,
        'bytes' => $bytes,
        'file' => 'assets/' . $relFromAssets,
        'thumb' => $thumbRel,
        'license' => 'CC0-1.0'
    ];
    
    $items[] = $item;
    
    // 詳細ページ作成
    writeDetailPage($item);
    
    echo "Processed: {$item['title']} ({$item['category']})\n";
}

/**
 * サムネイル画像作成
 */
function createThumbnail($srcPath, $destPath, $maxWidth = 480) {
    $imageInfo = getimagesize($srcPath);
    $srcWidth = $imageInfo[0];
    $srcHeight = $imageInfo[1];
    $srcType = $imageInfo[2];
    
    // アスペクト比を保持してリサイズ
    if ($srcWidth <= $maxWidth) {
        $newWidth = $srcWidth;
        $newHeight = $srcHeight;
    } else {
        $newWidth = $maxWidth;
        $newHeight = (int)($srcHeight * ($maxWidth / $srcWidth));
    }
    
    // ソース画像を読み込み
    switch ($srcType) {
        case IMAGETYPE_JPEG:
            $srcImage = imagecreatefromjpeg($srcPath);
            break;
        case IMAGETYPE_PNG:
            $srcImage = imagecreatefrompng($srcPath);
            break;
        case IMAGETYPE_WEBP:
            $srcImage = imagecreatefromwebp($srcPath);
            break;
        case IMAGETYPE_GIF:
            $srcImage = imagecreatefromgif($srcPath);
            break;
        default:
            echo "Unsupported image type: $srcPath\n";
            return false;
    }
    
    // 新しい画像を作成
    $destImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // PNG の透明度を保持
    if ($srcType == IMAGETYPE_PNG) {
        imagealphablending($destImage, false);
        imagesavealpha($destImage, true);
        $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
        imagefilledrectangle($destImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // リサイズ
    imagecopyresampled($destImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $srcWidth, $srcHeight);
    
    // JPEG で保存
    imagejpeg($destImage, $destPath, 80);
    
    // メモリ解放
    imagedestroy($srcImage);
    imagedestroy($destImage);
    
    return true;
}

/**
 * 詳細ページHTML作成
 */
function writeDetailPage($item) {
    global $ITEMS_DIR;
    
    $dir = $ITEMS_DIR . DIRECTORY_SEPARATOR . $item['slug'];
    ensureDir($dir);
    
    $baseUrl = getBaseUrl();
    $fullThumbUrl = $baseUrl . $item['thumb'];
    $fullFileUrl = $baseUrl . $item['file'];
    
    $html = '<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>' . htmlspecialchars($item['title']) . ' | Free Game Materials</title>
  <meta name="description" content="' . htmlspecialchars($item['category'] . ' カテゴリの' . $item['title'] . '. ' . implode(', ', $item['tags']) . ' などのタグが付いたフリー素材です。商用利用可能。') . '">
  <meta name="keywords" content="' . htmlspecialchars(implode(',', array_merge([$item['category'], $item['title']], $item['tags']))) . ',フリー素材,ゲーム素材,無料,商用利用可能">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="' . $baseUrl . 'items/' . $item['slug'] . '/">
  <meta property="og:title" content="' . htmlspecialchars($item['title']) . ' | Free Game Materials">
  <meta property="og:description" content="' . htmlspecialchars($item['category'] . ' · ' . implode(', ', $item['tags']) . ' · ' . ($item['width'] ?? '?') . '×' . ($item['height'] ?? '?')) . '">
  <meta property="og:image" content="' . $fullThumbUrl . '">
  <meta property="og:image:width" content="480">
  <meta property="og:image:height" content="' . (int)(480 * ($item['height'] ?? 1) / ($item['width'] ?? 1)) . '">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="' . $baseUrl . 'items/' . $item['slug'] . '/">
  <meta name="twitter:title" content="' . htmlspecialchars($item['title']) . ' | Free Game Materials">
  <meta name="twitter:description" content="' . htmlspecialchars($item['category'] . ' · ' . implode(', ', $item['tags']) . ' · ' . ($item['width'] ?? '?') . '×' . ($item['height'] ?? '?')) . '">
  <meta name="twitter:image" content="' . $fullThumbUrl . '">
  
  <!-- Canonical -->
  <link rel="canonical" href="' . $baseUrl . 'items/' . $item['slug'] . '/">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": "' . addslashes($item['title']) . '",
    "description": "' . addslashes($item['category'] . ' カテゴリの' . $item['title'] . '. ' . implode(', ', $item['tags']) . ' などのタグが付いたフリー素材') . '",
    "url": "' . $fullFileUrl . '",
    "thumbnailUrl": "' . $fullThumbUrl . '",
    "width": ' . ($item['width'] ?? 'null') . ',
    "height": ' . ($item['height'] ?? 'null') . ',
    "encodingFormat": "' . pathinfo($item['file'], PATHINFO_EXTENSION) . '",
    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "acquireLicensePage": "' . $baseUrl . 'items/' . $item['slug'] . '/",
    "creator": {
      "@type": "Organization",
      "name": "Free Game Materials"
    },
    "keywords": "' . implode(',', array_merge([$item['category']], $item['tags'])) . '",
    "isBasedOn": {
      "@type": "WebSite",
      "name": "Free Game Materials",
      "url": "' . $baseUrl . '"
    }
  }
  </script>
  
  <link rel="icon" href="data:," />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .hero-image { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .meta-card { background: #f8f9fa; border-radius: 12px; padding: 20px; }
    .download-btn { background: #007bff; border: none; }
    .download-btn:hover { background: #0056b3; }
  </style>
</head>
<body>
<div class="container mt-4">
  <!-- Breadcrumb -->
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="../../index.html">ホーム</a></li>
      <li class="breadcrumb-item"><a href="../../index.html#category=' . urlencode($item['category']) . '">' . htmlspecialchars($item['category']) . '</a></li>
      <li class="breadcrumb-item active" aria-current="page">' . htmlspecialchars($item['title']) . '</li>
    </ol>
  </nav>

  <div class="row">
    <div class="col-lg-8">
      <!-- メイン画像 -->
      <div class="text-center mb-4">
        <img src="../../' . htmlspecialchars($item['file']) . '" alt="' . htmlspecialchars($item['title']) . '" class="hero-image" loading="eager">
      </div>
      
      <!-- タイトルと説明 -->
      <h1 class="h2 mb-3">' . htmlspecialchars($item['title']) . '</h1>
      <p class="text-muted mb-4">
        このフリー素材は' . htmlspecialchars($item['category']) . 'カテゴリに分類されており、
        ' . htmlspecialchars(implode('、', $item['tags'])) . 'などのタグが付けられています。
        商用・非商用を問わず自由にご利用いただけます。
      </p>
    </div>
    
    <div class="col-lg-4">
      <!-- メタ情報 -->
      <div class="meta-card mb-4">
        <h3 class="h5 mb-3">素材情報</h3>
        <table class="table table-sm table-borderless">
          <tr><td><strong>カテゴリ:</strong></td><td>' . htmlspecialchars($item['category']) . '</td></tr>
          <tr><td><strong>タグ:</strong></td><td>' . htmlspecialchars(implode(', ', $item['tags']) ?: '-') . '</td></tr>
          <tr><td><strong>解像度:</strong></td><td>' . ($item['width'] ?? '?') . '×' . ($item['height'] ?? '?') . '</td></tr>
          <tr><td><strong>ファイルサイズ:</strong></td><td>' . formatSize($item['bytes']) . '</td></tr>
          <tr><td><strong>ライセンス:</strong></td><td>' . htmlspecialchars($item['license']) . '</td></tr>
        </table>
        
        <!-- ダウンロードボタン -->
        <div class="d-grid gap-2">
          <a class="btn btn-primary download-btn" href="../../' . htmlspecialchars($item['file']) . '" download>
            <i class="bi bi-download"></i> ダウンロード
          </a>
          <a class="btn btn-outline-secondary" href="../../' . htmlspecialchars($item['file']) . '" target="_blank" rel="noopener">
            原寸で表示
          </a>
        </div>
      </div>
      
      <!-- ライセンス情報 -->
      <div class="alert alert-info">
        <h6><strong>ライセンスについて</strong></h6>
        <small>
          この素材は ' . htmlspecialchars($item['license']) . ' ライセンスで提供されています。
          商用・非商用を問わず自由にご利用いただけます。
        </small>
      </div>
    </div>
  </div>
</div>

<footer class="border-top mt-5 py-3">
  <div class="container">
    <div class="text-center text-muted">
      <small>© 2025 Free Game Materials · ライセンスは各素材の表記に従います。</small>
    </div>
  </div>
</footer>
</body>
</html>';

    file_put_contents($dir . DIRECTORY_SEPARATOR . 'index.html', $html);
}

/**
 * ベースURLを取得
 */
function getBaseUrl() {
    $repo = getenv('GITHUB_REPOSITORY') ?: 'owner/repo';
    list($owner, $repoName) = explode('/', $repo, 2);
    return "https://{$owner}.github.io/{$repoName}/";
}

/**
 * sitemap.xml作成
 */
function buildSitemapXML($baseUrl, $routes) {
    $urlset = '';
    foreach ($routes as $url) {
        $urlset .= "  <url><loc>" . htmlspecialchars($url) . "</loc></url>\n";
    }
    
    return '<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
' . $urlset . '</urlset>';
}

// ---------- メイン処理実行 ----------

try {
    echo "Starting build process...\n";
    
    // .nojekyll ファイル作成
    file_put_contents($ROOT . DIRECTORY_SEPARATOR . '.nojekyll', '');
    
    // ディレクトリ作成
    ensureDir($ASSETS_DIR);
    ensureDir($ITEMS_DIR);
    ensureDir($THUMBS_DIR);
    
    // 画像ファイルを処理
    walkDirectory($ASSETS_DIR, function($filePath) {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        if (in_array('.' . $ext, $GLOBALS['validExt'])) {
            // _thumbs ディレクトリは除外
            if (strpos($filePath, DIRECTORY_SEPARATOR . '_thumbs' . DIRECTORY_SEPARATOR) === false) {
                handleImage($filePath);
            }
        }
    });
    
    // JSON出力
    $payload = [
        'updatedAt' => date('c'),
        'items' => $items
    ];
    file_put_contents($OUT_JSON, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // sitemap.xml作成
    $baseUrl = getBaseUrl();
    $routes = [
        $baseUrl,
        $baseUrl . 'index.html'
    ];
    
    foreach ($items as $item) {
        $routes[] = $baseUrl . $item['file'];
        $routes[] = $baseUrl . 'items/' . $item['slug'] . '/';
    }
    
    file_put_contents($OUT_SITEMAP, buildSitemapXML($baseUrl, array_unique($routes)));
    
    echo "\n=== Build Complete ===\n";
    echo "Generated " . count($items) . " items + detail pages + sitemap.xml + assets.json\n";
    echo "Items: " . count($items) . "\n";
    echo "Categories: " . count(array_unique(array_column($items, 'category'))) . "\n";
    echo "Total routes in sitemap: " . count(array_unique($routes)) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
