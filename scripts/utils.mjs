// scripts/utils.mjs
import fs from "fs/promises";
import path from "path";

/**
 * 文字列をスラグに変換
 */
export const toSlug = (s) => s.toLowerCase()
  .replace(/[^a-z0-9\-_.]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

/**
 * 重複しないスラグを生成するクラス
 */
export class SlugGenerator {
  constructor() {
    this.counter = new Map();
  }
  
  generate(base) {
    if (!this.counter.has(base)) {
      this.counter.set(base, 0);
      return base;
    }
    const n = this.counter.get(base) + 1;
    this.counter.set(base, n);
    return `${base}-${n}`;
  }
}

/**
 * ディレクトリを再帰的に作成
 */
export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * ファイルサイズを読みやすい形式に変換
 */
export function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

/**
 * テンプレートリテラル用のHTML関数
 */
export function html(strings, ...vals) {
  return strings.map((s, i) => s + (vals[i] ?? "")).join("");
}

/**
 * ディレクトリを再帰的に走査
 */
export async function walkDirectory(dir, callback) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(fullPath, callback);
    } else {
      await callback(fullPath);
    }
  }
}
