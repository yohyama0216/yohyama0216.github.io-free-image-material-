# PHPビルドシステム

Node.jsからPHPに置き換えたビルドシステムです。

## 必要要件

- PHP 8.1以上
- GD拡張モジュール（画像処理用）
- JSON拡張モジュール
- mbstring拡張モジュール

## ファイル構成

```
scripts/
├── build.php           # メインビルドスクリプト
├── Config.php          # 設定クラス
├── Utils.php           # ユーティリティクラス
├── ImageProcessor.php  # 画像処理クラス
├── HtmlGenerator.php   # HTML生成クラス
└── SitemapGenerator.php # サイトマップ生成クラス
```

## 実行方法

### Windows
```batch
build.bat
```

### コマンドライン
```bash
php scripts/build.php
```

## 機能

1. **画像処理**
   - assets/以下の画像ファイルを自動検出
   - サムネイル生成（GDライブラリ使用）
   - 画像情報の取得

2. **HTML生成**
   - detail.htmlテンプレートから詳細ページ生成
   - テンプレート変数の置換

3. **メタデータ処理**
   - .meta.jsonファイルからメタデータ読み込み
   - カテゴリ自動判定

4. **出力ファイル**
   - assets.json（素材一覧データ）
   - items/*/index.html（詳細ページ）
   - sitemap.xml（サイトマップ）

## Node.jsからの主な変更点

- Sharp → GDライブラリ
- ES Modules → PHP Classes
- npm scripts → PHPスクリプト
- GitHub Actions → PHP環境

## GitHub Actions

`.github/workflows/pages.yml`でPHP環境を使用するよう更新済み。
