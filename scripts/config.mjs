// scripts/config.mjs
import path from "path";

export const ROOT = process.cwd();
export const ASSETS_DIR = path.join(ROOT, "assets");
export const THUMBS_DIR = path.join(ASSETS_DIR, "_thumbs");
export const ITEMS_DIR = path.join(ROOT, "items");
export const OUT_JSON = path.join(ROOT, "assets.json");
export const OUT_SITEMAP = path.join(ROOT, "sitemap.xml");

export const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const THUMBNAIL_WIDTH = 480;
export const THUMBNAIL_QUALITY = 80;

export const DEFAULT_LICENSE = "CC0-1.0";
