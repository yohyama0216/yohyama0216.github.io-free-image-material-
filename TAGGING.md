# VSCode直接編集によるタグ管理

## 🎯 概要

VSCodeでファイルを直接編集してタグを管理するシンプルなシステム。

## 📁 ファイル構造

```
assets/
├── landscape/
│   ├── cuteroom1.jpg
│   └── cuteroom1.meta.json  # 手動で作成・編集
├── ui/
│   ├── button.jpg
│   └── button.meta.json     # オプション
```

## 🏷️ タグ付け方法

### 1. フォルダ構造による自動タグ

```
assets/ui/red-button.jpg
→ tags: ["ui"]  # フォルダ名が自動でタグになる

assets/landscape/nature/sky.jpg  
→ tags: ["landscape", "nature"]  # 階層フォルダがすべてタグに
```

### 2. メタデータファイルでの追加タグ

画像と同じディレクトリに `.meta.json` ファイルを作成：

```json
{
  "title": "赤いボタン",
  "description": "クリック可能な赤いボタンUI",
  "tags": ["interactive", "clickable", "red"],
  "category": "ui",
  "license": "CC0",
  "author": "作者名",
  "keywords": ["ボタン", "インターフェース"]
}
```

最終的なタグ：`["ui", "interactive", "clickable", "red"]`
（フォルダ構造 + メタデータファイルの統合）

## ✏️ VSCodeでの編集方法

### 新しい画像追加時

1. 適切なフォルダに画像を配置
2. 必要に応じて `.meta.json` ファイル作成
3. タグを配列で記述

### 既存画像のタグ編集

1. 対象の `.meta.json` ファイルを開く
2. `tags` 配列を編集
3. 保存

### JSONスキーマ（参考）

```json
{
  "title": "string (optional)",
  "description": "string (optional)", 
  "tags": ["string", "string", ...],
  "category": "string (optional)",
  "license": "string (optional)",
  "author": "string (optional)",
  "keywords": ["string", ...] (optional)
}
```

## 🔄 ビルド

```bash
# 通常ビルド
node scripts/build-index.mjs

# 増分ビルド（新しい画像のみ）
node scripts/incremental-build.mjs

# ファイル監視
node scripts/build-watcher.mjs
```

## 💡 ベストプラクティス

1. **フォルダ構造を活用**: 基本的なカテゴリはフォルダで分類
2. **メタデータは必要最小限**: 追加情報が必要な場合のみ使用
3. **タグの統一**: 同じ意味のタグは統一する（例：`btn` → `button`）
4. **日本語・英語混在OK**: 検索時に両方対応

この方法により、VSCodeの強力な編集機能を活用してタグ管理ができます。
