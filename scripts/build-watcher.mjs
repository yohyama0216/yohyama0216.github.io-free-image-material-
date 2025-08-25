// scripts/build-watcher.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { ASSETS_DIR } from "./config.mjs";

/**
 * ファイル監視機能付きの開発用ビルダー
 */
class BuildWatcher {
  constructor() {
    this.isBuilding = false;
    this.buildQueue = new Set();
    this.debounceTimer = null;
  }
  
  /**
   * ビルドを実行
   */
  async runBuild() {
    if (this.isBuilding) {
      console.log("Build already in progress, queuing...");
      return;
    }
    
    this.isBuilding = true;
    console.log(`\n🔨 Starting incremental build... (${new Date().toLocaleTimeString()})`);
    
    try {
      execSync('node scripts/incremental-build.mjs', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log("✅ Build completed successfully");
    } catch (error) {
      console.error("❌ Build failed:", error.message);
    } finally {
      this.isBuilding = false;
      
      // キューにあるビルドがあれば実行
      if (this.buildQueue.size > 0) {
        this.buildQueue.clear();
        setTimeout(() => this.runBuild(), 100);
      }
    }
  }
  
  /**
   * デバウンス付きビルド実行
   */
  debouncedBuild(changedFile) {
    console.log(`📁 File changed: ${path.relative(process.cwd(), changedFile)}`);
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.runBuild();
    }, 500); // 500ms待機
  }
  
  /**
   * ファイル監視開始
   */
  startWatching() {
    console.log("👀 Watching for changes in assets directory...");
    console.log(`📂 Monitoring: ${ASSETS_DIR}`);
    console.log("Press Ctrl+C to stop\n");
    
    // 初回ビルド
    this.runBuild();
    
    // ファイル監視
    const watcher = fs.watch(ASSETS_DIR, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      const fullPath = path.join(ASSETS_DIR, filename);
      
      // _thumbs ディレクトリは無視
      if (filename.includes('_thumbs')) return;
      
      // 画像ファイルのみ監視
      const ext = path.extname(filename).toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      if (!validExtensions.includes(ext)) return;
      
      // ファイルの存在確認（削除の場合もあるため）
      fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
          // ファイルが削除された場合
          console.log(`🗑️  File deleted: ${filename}`);
        } else {
          // ファイルが追加/変更された場合
          console.log(`${eventType === 'rename' ? '📝' : '✏️'} File ${eventType}: ${filename}`);
        }
        
        this.debouncedBuild(fullPath);
      });
    });
    
    // Ctrl+Cでの終了処理
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping file watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

// 使用方法の表示
function showUsage() {
  console.log(`
🚀 Build Watcher for Free Image Materials

Usage:
  node scripts/build-watcher.mjs [command]

Commands:
  watch     Start file watcher (default)
  build     Run single incremental build
  full      Run full build (ignores cache)

Examples:
  node scripts/build-watcher.mjs          # Start watching
  node scripts/build-watcher.mjs watch    # Start watching  
  node scripts/build-watcher.mjs build    # Single build
  node scripts/build-watcher.mjs full     # Full rebuild
`);
}

// メイン処理
const command = process.argv[2] || 'watch';

switch (command) {
  case 'watch':
    const watcher = new BuildWatcher();
    watcher.startWatching();
    break;
    
  case 'build':
    console.log("Running single incremental build...");
    execSync('node scripts/incremental-build.mjs', { stdio: 'inherit' });
    break;
    
  case 'full':
    console.log("Running full build (clearing cache)...");
    try {
      fs.unlinkSync('.build-cache.json');
      console.log("Cache cleared.");
    } catch (error) {
      // キャッシュファイルが存在しない場合は無視
    }
    execSync('node scripts/build-index.mjs', { stdio: 'inherit' });
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showUsage();
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    showUsage();
    process.exit(1);
}
