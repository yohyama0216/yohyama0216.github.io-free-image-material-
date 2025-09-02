import React from 'react';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link href="/" className="navbar-brand text-decoration-none">
            <i className="fas fa-image me-2"></i>
            フリー画像素材
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link">ホーム</Link>
              </li>
              <li className="nav-item">
                <Link href="/list" className="nav-link">素材一覧</Link>
              </li>
              <li className="nav-item">
                <Link href="/tags" className="nav-link">タグ一覧</Link>
              </li>
              <li className="nav-item">
                <Link href="/privacy-policy" className="nav-link">プライバシーポリシー</Link>
              </li>
              <li className="nav-item">
                <Link href="/external-transmission" className="nav-link">外部送信について</Link>
              </li>
              <li className="nav-item">
                <Link href="/terms" className="nav-link">利用規約</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-light py-4 mt-5">
        <div className="container text-center">
          <p>&copy; 2024 フリー画像素材. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/privacy-policy" className="text-muted me-3 text-decoration-none">プライバシーポリシー</Link>
            <Link href="/external-transmission" className="text-muted me-3 text-decoration-none">外部送信について</Link>
            <Link href="/terms" className="text-muted text-decoration-none">利用規約</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
