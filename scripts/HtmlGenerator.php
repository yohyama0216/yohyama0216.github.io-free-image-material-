<?php
/**
 * HTML生成クラス
 */
class HtmlGenerator
{
    private $config;
    
    public function __construct($config)
    {
        $this->config = $config;
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
}
