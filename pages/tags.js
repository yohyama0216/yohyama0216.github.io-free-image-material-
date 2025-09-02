import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // デモ用のタグデータ
  const allTags = [
    { name: "部屋", count: 1, color: "primary" },
    { name: "インテリア", count: 1, color: "success" },
    { name: "風景", count: 1, color: "info" },
    { name: "かわいい", count: 1, color: "warning" },
    { name: "リビング", count: 1, color: "danger" },
    { name: "家具", count: 1, color: "secondary" },
    { name: "UI", count: 0, color: "dark" },
    { name: "パターン", count: 0, color: "primary" },
    { name: "背景", count: 0, color: "success" },
    { name: "テクスチャ", count: 0, color: "info" },
    { name: "グラデーション", count: 0, color: "warning" },
    { name: "幾何学", count: 0, color: "danger" }
  ];

  useEffect(() => {
    setTags(allTags);
    setFilteredTags(allTags);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(allTags);
    }
  }, [searchQuery]);

  const totalItems = allTags.reduce((sum, tag) => sum + tag.count, 0);
  const popularTags = allTags.filter(tag => tag.count > 0).sort((a, b) => b.count - a.count);

  return (
    <>
      <Head>
        <title>タグ一覧 - フリー画像素材</title>
        <meta name="description" content="フリー画像素材のタグ一覧ページ。全てのタグとそれに紐づく素材の数を一覧表示します。" />
        <meta name="keywords" content="タグ一覧,フリー素材,検索,分類" />
        <meta property="og:title" content="タグ一覧 - フリー画像素材" />
        <meta property="og:description" content="フリー画像素材のタグ一覧ページ。全てのタグとそれに紐づく素材の数を一覧表示します。" />
        <meta property="og:type" content="website" />
      </Head>
      
      <Layout>
        {/* ヒーローセクション */}
        <section className="bg-primary text-white py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h1 className="display-4 fw-bold mb-3">🏷️ タグ一覧</h1>
                <p className="lead mb-4">
                  全てのタグとそれに紐づく素材の数を一覧表示します。タグをクリックして該当する素材を検索できます。
                </p>
                <a href="/" className="btn btn-light btn-lg">
                  ← ホームに戻る
                </a>
              </div>
              <div className="col-lg-4 text-center">
                <div className="bg-white bg-opacity-10 rounded p-4">
                  <h3 className="h5 mb-3">📊 タグ統計</h3>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="h4 fw-bold">{allTags.length}</div>
                      <small>総タグ数</small>
                    </div>
                    <div className="col-6">
                      <div className="h4 fw-bold">{totalItems}</div>
                      <small>総素材数</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* メインコンテンツ */}
        <main className="py-4">
          <div className="container">
            {/* 検索ボックス */}
            <div className="row mb-4">
              <div className="col-md-6">
                <input
                  type="search"
                  className="form-control form-control-lg"
                  placeholder="タグ名を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <div className="text-md-end mt-3 mt-md-0">
                  <span className="badge bg-info fs-6">
                    {filteredTags.length} / {allTags.length} タグ表示中
                  </span>
                </div>
              </div>
            </div>

            {/* 人気タグ */}
            {popularTags.length > 0 && !searchQuery && (
              <div className="row mb-5">
                <div className="col-12">
                  <h3 className="mb-3">
                    <i className="fas fa-fire text-danger"></i> 人気タグ
                  </h3>
                  <div className="d-flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <a
                        key={tag.name}
                        href={`/list?tag=${tag.name}`}
                        className={`badge bg-${tag.color} text-decoration-none fs-6 px-3 py-2`}
                        style={{ cursor: 'pointer' }}
                      >
                        {tag.name} ({tag.count})
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* タグクラウド */}
            <div className="row mb-4">
              <div className="col-12">
                <h3 className="mb-3">
                  <i className="fas fa-tags"></i> 全タグ
                  {searchQuery && (
                    <small className="text-muted ms-2">
                      「{searchQuery}」の検索結果
                    </small>
                  )}
                </h3>
              </div>
            </div>

            {filteredTags.length > 0 ? (
              <>
                {/* タググリッド表示 */}
                <div className="row">
                  {filteredTags.map((tag, index) => (
                    <div key={tag.name} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className={`badge bg-${tag.color} fs-6`}>
                              {tag.name}
                            </span>
                            <small className="text-muted">#{index + 1}</small>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted small">
                                {tag.count} 個の素材
                              </span>
                              <a
                                href={`/list?tag=${tag.name}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="fas fa-search"></i> 検索
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* タグクラウド表示 */}
                <div className="row mt-5">
                  <div className="col-12">
                    <h4 className="mb-3">
                      <i className="fas fa-cloud"></i> タグクラウド
                    </h4>
                    <div className="p-4 bg-light rounded">
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {filteredTags.map((tag) => {
                          const fontSize = Math.max(0.8, Math.min(2, 0.8 + (tag.count * 0.2)));
                          return (
                            <a
                              key={`cloud-${tag.name}`}
                              href={`/list?tag=${tag.name}`}
                              className="text-decoration-none"
                              style={{
                                fontSize: `${fontSize}rem`,
                                fontWeight: tag.count > 0 ? 'bold' : 'normal',
                                opacity: tag.count > 0 ? 1 : 0.6
                              }}
                            >
                              {tag.name}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="row">
                <div className="col-12">
                  <div className="text-center py-5">
                    <i className="fas fa-search text-muted" style={{ fontSize: '4rem' }}></i>
                    <h4 className="mt-3 text-muted">タグが見つかりませんでした</h4>
                    <p className="text-muted">
                      「{searchQuery}」に一致するタグはありません。
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="fas fa-undo me-2"></i>
                      全てのタグを表示
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="row mt-5">
              <div className="col-12 text-center">
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <a href="/list" className="btn btn-primary btn-lg">
                    <i className="fas fa-th me-2"></i>
                    素材一覧を見る
                  </a>
                  <a href="/" className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-home me-2"></i>
                    ホームに戻る
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default TagsPage;
