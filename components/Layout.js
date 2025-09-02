import React from 'react';

const Layout = ({ children }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="fas fa-image me-2"></i>
            フリー画像素材
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">ホーム</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/privacy-policy">プライバシーポリシー</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/external-transmission">外部送信について</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/terms">利用規約</a>
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
            <a href="/privacy-policy" className="text-muted me-3">プライバシーポリシー</a>
            <a href="/external-transmission" className="text-muted me-3">外部送信について</a>
            <a href="/terms" className="text-muted">利用規約</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
