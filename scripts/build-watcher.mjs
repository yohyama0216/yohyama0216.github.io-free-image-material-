// scripts/build-watcher.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { ASSETS_DIR, ROOT } from "./config.mjs";

/**// 使用方法の表示
function showUsage() {
  console.log(`
🚀 Enhanced Build Watcher for Free Image Materials

Usage:
  node scripts/build-watcher.mjs [command]

Commands:
  watch     Start comprehensive file watcher (default)
  build     Run single incremental build
  full      Run full build (ignores cache)

Examples:
  node scripts/build-watcher.mjs          # Start watching all files
  node scripts/build-watcher.mjs watch    # Start comprehensive watching  
  node scripts/build-watcher.mjs build    # Single incremental build
  node scripts/build-watcher.mjs full     # Full rebuild

Monitoring:
  📂 Images:     assets/**/*.{jpg,jpeg,png,webp}
  🎨 Templates:  index.html, scripts/html-generator.mjs, scripts/config.mjs
  ⚙️  Scripts:   scripts/**/*.mjs
`);
}ダー
 */
class BuildWatcher {
  constructor() {
    this.isBuilding = false;
    this.buildQueue = new Set();
    this.debounceTimer = null;
    this.watchers = [];
  }
  
  /**
   * ビルドを実行
   */
  async runBuild(triggerType = 'auto') {
    if (this.isBuilding) {
      console.log("Build already in progress, queuing...");
      return;
    }
    
    this.isBuilding = true;
    console.log(`\n🔨 Starting ${triggerType} build... (${new Date().toLocaleTimeString()})`);
    
    try {
      if (triggerType === 'template') {
        // テンプレート変更時は増分ビルドで詳細ページ再生成
        console.log("🎨 Template changes detected, regenerating detail pages...");
        execSync('node scripts/incremental-build.mjs --force-templates', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } else {
        // 通常の増分ビルド
        execSync('node scripts/incremental-build.mjs', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      }
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
  debouncedBuild(changedFile, buildType = 'auto') {
    console.log(`📁 File changed: ${path.relative(process.cwd(), changedFile)}`);
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.runBuild(buildType);
    }, 500); // 500ms待機
  }
  
  /**
   * assetsディレクトリの監視
   */
  watchAssets() {
    console.log(`📂 Monitoring assets: ${ASSETS_DIR}`);
    
    const assetsWatcher = fs.watch(ASSETS_DIR, { recursive: true }, (eventType, filename) => {
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
          console.log(`🗑️  Image deleted: ${filename}`);
        } else {
          console.log(`${eventType === 'rename' ? '📝' : '✏️'} Image ${eventType}: ${filename}`);
        }
        
        this.debouncedBuild(fullPath, 'image');
      });
    });
    
    this.watchers.push(assetsWatcher);
  }
  
  /**
   * テンプレートファイルの監視
   */
  watchTemplates() {
    const templateFiles = [
      path.join(ROOT, 'index.html'),
      path.join(ROOT, 'scripts', 'html-generator.mjs'),
      path.join(ROOT, 'scripts', 'config.mjs')
    ];
    
    console.log(`🎨 Monitoring templates:`);
    templateFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`   - ${path.relative(ROOT, file)}`);
        
        const watcher = fs.watch(file, (eventType, filename) => {
          console.log(`🎨 Template ${eventType}: ${path.relative(ROOT, file)}`);
          this.debouncedBuild(file, 'template');
        });
        
        this.watchers.push(watcher);
      }
    });
  }
  
  /**
   * scriptsディレクトリの監視（ビルドスクリプト変更時）
   */
  watchScripts() {
    const scriptsDir = path.join(ROOT, 'scripts');
    console.log(`⚙️  Monitoring scripts: ${scriptsDir}`);
    
    const scriptsWatcher = fs.watch(scriptsDir, (eventType, filename) => {
      if (!filename || !filename.endsWith('.mjs')) return;
      
      // 自分自身（build-watcher.mjs）は除外
      if (filename === 'build-watcher.mjs') return;
      
      const fullPath = path.join(scriptsDir, filename);
      console.log(`⚙️  Script ${eventType}: ${filename}`);
      this.debouncedBuild(fullPath, 'script');
    });
    
    this.watchers.push(scriptsWatcher);
  }
  
  /**
   * 全ファイル監視開始
   */
  startWatching() {
    console.log("👀 Starting comprehensive file watcher...");
    console.log("Press Ctrl+C to stop\n");
    
    // 各種ファイル監視開始
    this.watchAssets();
    this.watchTemplates();
    this.watchScripts();
    
    // 初回ビルド
    this.runBuild('initial');
    
    // Ctrl+Cでの終了処理
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping file watchers...');
      this.watchers.forEach(watcher => watcher.close());
      process.exit(0);
    });
  }
}

// 使用方法の表示
function showUsage() {
  console.log(`
🚀 Enhanced Build Watcher for Free Image Materials

Usage:
  node scripts/build-watcher.mjs [command]

Commands:
  watch     Start comprehensive file watcher (default)
  build     Run single incremental build
  full      Run full build (ignores cache)

Examples:
  node scripts/build-watcher.mjs          # Start watching all files
  node scripts/build-watcher.mjs watch    # Start comprehensive watching  
  node scripts/build-watcher.mjs build    # Single incremental build
  node scripts/build-watcher.mjs full     # Full rebuild

Monitoring:
  📂 Images:     assets/**/*.{jpg,jpeg,png,webp}
  🎨 Templates:  index.html, scripts/html-generator.mjs, scripts/config.mjs
  ⚙️  Scripts:   scripts/**/*.mjs
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
