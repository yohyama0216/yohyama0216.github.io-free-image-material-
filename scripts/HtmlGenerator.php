<?php
/**
 * HTML生成クラス
 */
class HtmlGenerator
{
    private $config;
    private $allItems = [];
    
    public function __construct($config)
    {
        $this->config = $config;
    }
    
    /**
     * 全アイテムを設定（関連素材計算用）
     */
    public function setAllItems($items)
    {
        $this->allItems = $items;
    }
    
    /**
     * 詳細ページ書き出し
     */
    public function writeDetailPage($item)
    {
        $itemDir = $this->config->getItemsDir() . '/' . $item['slug'];
        Utils::ensureDir($itemDir);
        
        $template = $this->loadTemplate();
        $html = $this->replaceTemplateVariables($template, $item);
        
        file_put_contents($itemDir . '/index.html', $html);
    }
    
    /**
     * テンプレート読み込み
     */
    private function loadTemplate()
    {
        $templatePath = $this->config->getRoot() . '/detail.html';
        
        if (!file_exists($templatePath)) {
            throw new Exception("Template file not found: $templatePath");
        }
        
        return file_get_contents($templatePath);
    }
    
    /**
     * テンプレート変数置換
     */
    private function replaceTemplateVariables($template, $item)
    {
        $extension = strtoupper(pathinfo($item['originalPath'], PATHINFO_EXTENSION));
        $filename = pathinfo($item['originalPath'], PATHINFO_FILENAME) . '.' . pathinfo($item['originalPath'], PATHINFO_EXTENSION);
        
        $replacements = [
            '{{title}}' => htmlspecialchars($item['title'], ENT_QUOTES, 'UTF-8'),
            '{{category}}' => htmlspecialchars($item['category'], ENT_QUOTES, 'UTF-8'),
            '{{description}}' => htmlspecialchars($item['description'], ENT_QUOTES, 'UTF-8'),
            '{{license}}' => htmlspecialchars($item['license'], ENT_QUOTES, 'UTF-8'),
            '{{originalPath}}' => htmlspecialchars($item['originalPath'], ENT_QUOTES, 'UTF-8'),
            '{{thumbnailPath}}' => htmlspecialchars($item['thumbnailPath'], ENT_QUOTES, 'UTF-8'),
            '{{width}}' => $item['width'],
            '{{height}}' => $item['height'],
            '{{fileSize}}' => Utils::formatSize($item['fileSize']),
            '{{slug}}' => htmlspecialchars($item['slug'], ENT_QUOTES, 'UTF-8'),
            '{{createdAt}}' => htmlspecialchars($item['createdAt'], ENT_QUOTES, 'UTF-8'),
            '{{updatedAt}}' => htmlspecialchars($item['updatedAt'], ENT_QUOTES, 'UTF-8'),
            '{{format}}' => $extension,
            '{{filename}}' => htmlspecialchars($filename, ENT_QUOTES, 'UTF-8'),
            '{{tags}}' => implode(',', array_map(function($tag) {
                return htmlspecialchars($tag, ENT_QUOTES, 'UTF-8');
            }, $item['tags']))
        ];
        
        $html = str_replace(array_keys($replacements), array_values($replacements), $template);
        
        // タグリスト用の特別な処理
        $html = $this->replaceTagsList($html, $item['tags']);
        
        // 関連素材の処理
        $html = $this->replaceRelatedItems($html, $item);
        
        return $html;
    }
    
    /**
     * タグリスト置換
     */
    private function replaceTagsList($html, $tags)
    {
        // {{#each tags}}...{{/each}} パターンを処理
        $pattern = '/\{\{#each tags\}\}(.*?)\{\{\/each\}\}/s';
        
        return preg_replace_callback($pattern, function($matches) use ($tags) {
            $template = $matches[1];
            $result = '';
            
            foreach ($tags as $index => $tag) {
                $tagHtml = str_replace('{{this}}', htmlspecialchars($tag, ENT_QUOTES, 'UTF-8'), $template);
                $tagHtml = str_replace('{{@last}}', ($index === count($tags) - 1) ? 'true' : 'false', $tagHtml);
                $result .= $tagHtml;
            }
            
            return $result;
        }, $html);
    }
    
    /**
     * 関連素材置換
     */
    private function replaceRelatedItems($html, $currentItem)
    {
        $relatedItems = $this->findRelatedItems($currentItem);
        
        // {{#each relatedItems}}...{{/each}} パターンを処理
        $pattern = '/\{\{#each relatedItems\}\}(.*?)\{\{\/each\}\}/s';
        $html = preg_replace_callback($pattern, function($matches) use ($relatedItems) {
            $template = $matches[1];
            $result = '';
            
            foreach ($relatedItems as $index => $item) {
                $itemHtml = $template;
                $itemHtml = str_replace('{{title}}', htmlspecialchars($item['title'], ENT_QUOTES, 'UTF-8'), $itemHtml);
                $itemHtml = str_replace('{{slug}}', htmlspecialchars($item['slug'], ENT_QUOTES, 'UTF-8'), $itemHtml);
                $itemHtml = str_replace('{{category}}', htmlspecialchars($item['category'], ENT_QUOTES, 'UTF-8'), $itemHtml);
                $itemHtml = str_replace('{{thumbnailPath}}', htmlspecialchars($item['thumbnailPath'], ENT_QUOTES, 'UTF-8'), $itemHtml);
                $itemHtml = str_replace('{{@last}}', ($index === count($relatedItems) - 1) ? 'true' : 'false', $itemHtml);
                $result .= $itemHtml;
            }
            
            return $result;
        }, $html);
        
        // {{#unless relatedItems}}...{{/unless}} パターンを処理
        $unlessPattern = '/\{\{#unless relatedItems\}\}(.*?)\{\{\/unless\}\}/s';
        $html = preg_replace_callback($unlessPattern, function($matches) use ($relatedItems) {
            // 関連素材がない場合のみ内容を表示
            return empty($relatedItems) ? $matches[1] : '';
        }, $html);
        
        return $html;
    }
    
    /**
     * 関連素材を検索
     */
    private function findRelatedItems($currentItem)
    {
        if (empty($this->allItems)) {
            return [];
        }
        
        $relatedItems = [];
        $currentTags = $currentItem['tags'];
        $currentCategory = $currentItem['category'];
        $currentSlug = $currentItem['slug'];
        
        foreach ($this->allItems as $item) {
            if ($item['slug'] === $currentSlug) {
                continue; // 自分自身は除外
            }
            
            $score = 0;
            
            // 同じカテゴリの場合は高スコア
            if ($item['category'] === $currentCategory) {
                $score += 10;
            }
            
            // 共通タグの数に応じてスコア加算
            $commonTags = array_intersect($currentTags, $item['tags']);
            $score += count($commonTags) * 3;
            
            if ($score > 0) {
                $item['_score'] = $score;
                $relatedItems[] = $item;
            }
        }
        
        // スコア順でソート
        usort($relatedItems, function($a, $b) {
            return $b['_score'] - $a['_score'];
        });
        
        // 最大6個まで返す
        return array_slice($relatedItems, 0, 6);
    }
}
