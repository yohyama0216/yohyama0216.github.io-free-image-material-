import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import MaterialCard from '../components/MaterialCard';

const ListPage = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // デモ用のデータ
  const allMaterials = [
    {
      id: "cuteroom1",
      title: "かわいい部屋 1",
      description: "温かみのあるかわいい部屋の風景",
      category: "風景",
      thumbnailUrl: "/assets/landscape/cuteroom1.jpg",
      downloadUrl: "/assets/landscape/cuteroom1.jpg",
      filename: "cuteroom1.jpg",
      tags: ["部屋", "インテリア", "風景", "かわいい", "リビング", "家具"]
    }
  ];

  const categories = ["全て", "風景", "UI", "パターン", "イラスト"];
  const allTags = ["部屋", "インテリア", "風景", "かわいい", "リビング", "家具", "UI", "パターン"];

  useEffect(() => {
    setMaterials(allMaterials);
    setFilteredMaterials(allMaterials);
  }, []);

  useEffect(() => {
    let filtered = allMaterials;

    // カテゴリフィルター
    if (selectedCategory !== 'all' && selectedCategory !== '全て') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter(material => 
        selectedTags.some(tag => material.tags.includes(tag))
      );
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMaterials(filtered);
  }, [selectedCategory, selectedTags, searchQuery]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <>
      <Head>
        <title>素材一覧 - フリー画像素材</title>
        <meta name="description" content="フリー画像素材の全素材一覧。カテゴリやタグで検索・絞り込みができます。" />
        <meta name="keywords" content="フリー素材,無料,画像,イラスト,背景,UI,パターン,検索" />
      </Head>
      
      <Layout>
        {/* ページヘッダー */}
        <section className="bg-gradient-primary text-white py-5" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }}>
          <div className="container text-center">
            <h1 className="display-5 fw-bold mb-3">
              <i className="fas fa-search"></i> 素材を探す
            </h1>
            <p className="lead mb-0">キーワード、カテゴリ、タグで絞り込んで理想の素材を見つけよう</p>
          </div>
        </section>

        {/* 統計情報 */}
        <section className="py-4 bg-light">
          <div className="container">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="h4 fw-bold text-primary">{allMaterials.length}</div>
                <div className="text-muted">総素材数</div>
              </div>
              <div className="col-md-3">
                <div className="h4 fw-bold text-primary">{categories.length - 1}</div>
                <div className="text-muted">カテゴリ</div>
              </div>
              <div className="col-md-3">
                <div className="h4 fw-bold text-primary">{allTags.length}</div>
                <div className="text-muted">タグ</div>
              </div>
              <div className="col-md-3">
                <div className="h4 fw-bold text-primary">{filteredMaterials.length}</div>
                <div className="text-muted">検索結果</div>
              </div>
            </div>
          </div>
        </section>

        {/* 検索・フィルター */}
        <section className="py-4">
          <div className="container">
            {/* 検索バー */}
            <div className="row mb-4">
              <div className="col-lg-6 mx-auto">
                <div className="input-group input-group-lg">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="素材名、説明、タグで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div className="row mb-4">
              <div className="col-12">
                <h5 className="mb-3">
                  <i className="fas fa-folder"></i> カテゴリ
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`btn ${selectedCategory === category || (category === '全て' && selectedCategory === 'all') 
                        ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedCategory(category === '全て' ? 'all' : category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* タグフィルター */}
            <div className="row mb-4">
              <div className="col-12">
                <h5 className="mb-3">
                  <i className="fas fa-tags"></i> タグ
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`btn btn-sm ${selectedTags.includes(tag) 
                        ? 'btn-success' : 'btn-outline-secondary'}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-2">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setSelectedTags([])}
                    >
                      <i className="fas fa-times"></i> タグをクリア
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 結果表示 */}
        <section className="py-4">
          <div className="container">
            {/* 結果情報 */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none'
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>{filteredMaterials.length}</strong> 件の素材が見つかりました
                      {(selectedCategory !== 'all' && selectedCategory !== '全て') && (
                        <span> （カテゴリ: {selectedCategory}）</span>
                      )}
                      {selectedTags.length > 0 && (
                        <span> （タグ: {selectedTags.join(', ')}）</span>
                      )}
                    </div>
                    {(selectedCategory !== 'all' || selectedTags.length > 0 || searchQuery) && (
                      <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedTags([]);
                          setSearchQuery('');
                        }}
                      >
                        <i className="fas fa-undo"></i> リセット
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 素材グリッド */}
            <div className="row">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center py-5">
                    <i className="fas fa-search text-muted" style={{ fontSize: '4rem' }}></i>
                    <h4 className="mt-3 text-muted">素材が見つかりませんでした</h4>
                    <p className="text-muted">
                      検索条件を変更するか、フィルターをリセットしてお試しください。
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedTags([]);
                        setSearchQuery('');
                      }}
                    >
                      <i className="fas fa-undo me-2"></i>
                      すべての素材を表示
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ListPage;
