# 多対多タグシステム - 使用方法

## 🎯 概要

画像とタグの多対多関係を効率的に管理するシステムです。

### 主要な特徴
- ✅ 1つの画像に複数のタグ
- ✅ 1つのタグが複数の画像に関連
- ✅ 階層構造のタグ（親子関係）
- ✅ 自動タグ生成 + 手動タグ管理
- ✅ タグ統計と関連性分析
- ✅ 色分け表示とエイリアス対応

## 📁 ファイル構造

```
yohyama0216.github.io-free-image-material-/
├── data/
│   ├── tags.json           # タグ定義（名前、色、階層など）
│   └── tag-mappings.json   # 自動タグ生成ルール
├── scripts/
│   ├── tag-system.mjs      # タグシステムのコア
│   ├── image-processor.mjs # 画像処理（タグ統合済み）
│   └── tag-manager.mjs     # CLIツール
├── assets/
│   └── landscape/
│       ├── cuteroom1.jpg
│       └── cuteroom1.meta.json  # 手動タグ定義
└── tag-editor.html         # Web UIエディタ
```

## 🏷️ タグの定義方法

### 1. グローバルタグ定義 (`data/tags.json`)

```json
{
  "tags": [
    {
      "id": "ui",
      "name": "ユーザーインターフェース",
      "description": "ゲームのUI要素", 
      "category": "interface",
      "color": "#007bff",
      "aliases": ["interface", "gui"],
      "parent": null,
      "children": ["button", "menu"]
    }
  ]
}
```

### 2. 自動タグルール (`data/tag-mappings.json`)

```json
{
  "fileNamePatterns": {
    "button": ["ui", "button"],
    "sky": ["nature", "sky", "outdoor"]
  },
  "directoryPatterns": {
    "ui": ["ui"],
    "landscape": ["nature", "outdoor"]
  }
}
```

### 3. 画像個別メタデータ (`.meta.json`)

```json
{
  "title": "可愛い部屋の風景",
  "tags": ["indoor", "cute", "house", "bright"],
  "category": "landscape",
  "colors": ["warm", "brown"],
  "mood": ["cozy"],
  "style": ["cute", "modern"]
}
```

## ⚙️ 使用方法

### CLIでタグ管理

```bash
# メタデータファイル作成
node scripts/tag-manager.mjs create assets/ui/button.jpg ui,interactive,red

# タグ追加
node scripts/tag-manager.mjs add assets/landscape/sky.jpg blue,outdoor

# 全タグ一覧
node scripts/tag-manager.mjs list
```

### Web UIでタグ編集

1. `tag-editor.html`をブラウザで開く
2. 画像をクリック
3. タグを追加/削除
4. 保存

### ビルド時の処理

```bash
# 通常のビルド（自動タグ + 手動タグ統合）
node scripts/build-index.mjs

# 増分ビルド
node scripts/incremental-build.mjs
```

## 🔍 検索とフィルタリング

### index.htmlでの検索

- **キーワード検索**: タグ名、説明、エイリアスを対象
- **タグクラウド**: 使用頻度に応じたサイズ表示
- **複数タグ選択**: AND検索で絞り込み
- **関連タグ表示**: 選択中タグと一緒に使われるタグ

### プログラム的な検索

```javascript
import TagSystem from './scripts/tag-system.mjs';

const tagSystem = new TagSystem();
await tagSystem.loadTagDefinitions('data/tags.json');

// タグ検索
const results = tagSystem.searchTags('ボタン', 10);

// 関連タグ取得
const related = tagSystem.getRelatedTags('ui', 5);

// 画像に関連するタグ取得
const imageTags = tagSystem.getTagsForImage('button1');
```

## 📊 統計と分析

### タグ統計

```javascript
// 使用頻度順のタグ統計
const stats = tagSystem.getTagStats();

// 関連性分析
const related = tagSystem.getRelatedTags('ui');
```

### 表示例

- **タグクラウド**: `ui (15)` `nature (8)` `button (5)`
- **色分け**: カテゴリごとに異なる色
- **階層表示**: 親タグ > 子タグ の関係

## 🔧 カスタマイズ

### 新しいタグカテゴリ追加

1. `data/tags.json`に定義追加
2. `data/tag-mappings.json`に自動ルール追加
3. `tag-editor.html`のスタイル調整

### 自動タグルール拡張

```json
{
  "autoRules": [
    {
      "condition": {
        "type": "filename_contains",
        "value": "medieval"
      },
      "tags": ["medieval", "fantasy"]
    }
  ]
}
```

## 🚀 パフォーマンス最適化

- **遅延読み込み**: タグ定義の非同期ロード
- **キャッシュ**: 関連性分析結果のメモ化
- **増分更新**: 変更された画像のみタグ再計算

この多対多タグシステムにより、柔軟で拡張性の高い画像分類が可能になります。
