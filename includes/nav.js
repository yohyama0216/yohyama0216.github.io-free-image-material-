// 共通ナビゲーション読み込み用JavaScript
async function loadNavigation() {
  try {
    const response = await fetch('includes/nav.html');
    const navHTML = await response.text();
    
    // ナビゲーション挿入ポイントを探す
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
      navPlaceholder.innerHTML = navHTML;
    } else {
      // プレースホルダーがない場合は、bodyの最初に挿入
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
  } catch (error) {
    console.error('ナビゲーションの読み込みに失敗しました:', error);
  }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', loadNavigation);
