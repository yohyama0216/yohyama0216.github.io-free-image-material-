# 増分ビルドシステム

新しくassetsに追加された画像のみを差分でビルドするシステムです。

## 🚀 機能

### 1. **増分ビルド** (`incremental-build.mjs`)
- ファイルのMD5ハッシュで変更を検出
- 新規追加・変更・削除されたファイルのみ処理
- ビルドキャッシュ（`.build-cache.json`）で状態管理
- 既存の詳細ページやサムネイルはそのまま維持

### 2. **ファイル監視** (`build-watcher.mjs`)
- リアルタイムでassetsディレクトリを監視
- ファイル変更時に自動で増分ビルド実行
- デバウンス機能で連続変更時の無駄なビルドを防止

## 📁 生成されるファイル

- `.build-cache.json` - ビルドキャッシュ（ファイルハッシュ、最終更新日時、アイテム情報）
- 既存の `assets.json`, `sitemap.xml` は増分更新

## 🔧 使用方法

### 開発時（推奨）
```bash
# ファイル監視開始（リアルタイムビルド）
node scripts/build-watcher.mjs watch
```

### 手動ビルド
```bash
# 増分ビルド（変更分のみ）
node scripts/build-watcher.mjs build

# フルビルド（全て再生成）
node scripts/build-watcher.mjs full
```

### 本番環境（CI/CD）
```bash
# 通常のフルビルド
node scripts/build-index.mjs

# または増分ビルド（キャッシュがある場合）
node scripts/incremental-build.mjs
```

## ⚡ パフォーマンス効果

- **フルビルド**: 全ファイル処理（100枚なら100枚全て）
- **増分ビルド**: 変更分のみ処理（新規5枚なら5枚のみ）

大量の画像がある環境では、ビルド時間を大幅に短縮できます。

## 🔍 動作の流れ

1. **変更検出**: ファイルハッシュで新規・変更・削除を判定
2. **処理**: 変更されたファイルのみサムネイル生成・HTML作成
3. **統合**: 既存アイテム + 新規アイテムでJSON・sitemap更新
4. **キャッシュ更新**: 次回の差分ビルド用に状態保存

## 🎯 適用例

```bash
# 最初のセットアップ
node scripts/build-index.mjs

# 新しい画像を assets/ui/ に追加
cp new-button.png assets/ui/

# 増分ビルド（new-button.png のみ処理）
node scripts/incremental-build.mjs
```

これで効率的な開発ワークフローが可能になります！
