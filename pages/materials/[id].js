import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';

const MaterialDetailPage = ({ material, relatedMaterials }) => {
  return (
    <>
      <Head>
        <title>{material.title} - フリー画像素材</title>
        <meta name="description" content={`${material.title} - ${material.category}カテゴリのフリー画像素材。高品質素材を無料でダウンロード。商用利用可能。`} />
        <meta name="keywords" content={`${material.tags.join(',')},フリー素材,${material.category},無料ダウンロード,商用利用可能`} />
        <meta property="og:title" content={`${material.title} - フリー画像素材`} />
        <meta property="og:description" content={`${material.title} - ${material.category}カテゴリのフリー画像素材。高品質素材を無料でダウンロード。`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={material.originalPath} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${material.title} - フリー画像素材`} />
        <meta name="twitter:description" content={`${material.title} - ${material.category}カテゴリのフリー画像素材`} />
        <meta name="twitter:image" content={material.originalPath} />
      </Head>
      
      <Layout>
        {/* メインコンテンツ */}
        <main className="py-4">
          <div className="container">
            {/* パンくずナビ */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-decoration-none">ホーム</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href={`/?category=${material.category}`} className="text-decoration-none">{material.category}</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{material.title}</li>
              </ol>
            </nav>

            <div className="row">
              {/* 画像表示エリア */}
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <img 
                      src={material.originalPath} 
                      alt={material.title} 
                      className="img-fluid rounded mb-3" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '500px', 
                        objectFit: 'contain', 
                        backgroundColor: '#f8f9fa' 
                      }}
                    />
                    
                    {/* ダウンロードボタン */}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <a 
                        href={material.originalPath} 
                        download={material.filename} 
                        className="btn btn-primary btn-lg"
                      >
                        <i className="fas fa-download"></i> 高解像度版をダウンロード
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h1 className="h4 mb-0">{material.title}</h1>
                  </div>
                  <div className="card-body">
                    {/* 基本情報 */}
                    <div className="mb-3">
                      <h6 className="fw-semibold text-muted">基本情報</h6>
                      <ul className="list-unstyled mb-0">
                        <li><strong>カテゴリ:</strong> <span className="badge bg-primary">{material.category}</span></li>
                        <li><strong>サイズ:</strong> {material.width} × {material.height} px</li>
                        <li><strong>ファイル形式:</strong> {material.format}</li>
                        <li><strong>ライセンス:</strong> <span className="badge bg-success">{material.license}</span></li>
                      </ul>
                    </div>

                    {/* タグ */}
                    <div className="mb-3">
                      <h6 className="fw-semibold text-muted">タグ</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {material.tags.map((tag, index) => (
                          <Link 
                            key={index}
                            href={`/?tag=${tag}`} 
                            className="badge bg-light text-dark text-decoration-none"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* 利用条件 */}
                    <div className="mb-3">
                      <h6 className="fw-semibold text-muted">利用条件</h6>
                      <ul className="list-unstyled text-success">
                        <li><i className="fas fa-check"></i> 商用利用可能</li>
                        <li><i className="fas fa-check"></i> クレジット表記不要</li>
                        <li><i className="fas fa-check"></i> 加工・改変OK</li>
                        <li><i className="fas fa-check"></i> 再配布可能</li>
                      </ul>
                    </div>

                    {/* 説明文 */}
                    {material.description && (
                      <div className="mb-3">
                        <h6 className="fw-semibold text-muted">説明</h6>
                        <p className="text-muted">{material.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 関連素材 */}
                <div className="card shadow-sm mt-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fas fa-th-large"></i> 関連する素材
                    </h6>
                    <small className="text-muted">タグ・カテゴリが類似する素材</small>
                  </div>
                  <div className="card-body">
                    {relatedMaterials && relatedMaterials.length > 0 ? (
                      <div className="row g-3">
                        {relatedMaterials.map((relatedMaterial) => (
                          <div key={relatedMaterial.id} className="col-lg-4 col-md-6">
                            <Link href={`/materials/${relatedMaterial.id}`} className="text-decoration-none">
                              <div className="card h-100 border-0 shadow-sm">
                                <div className="position-relative">
                                  <img 
                                    src={relatedMaterial.thumbnailPath} 
                                    className="card-img-top" 
                                    style={{ height: '120px', objectFit: 'cover' }}
                                    alt={relatedMaterial.title}
                                  />
                                  <div className="position-absolute top-0 end-0 m-2">
                                    <span className="badge bg-primary small">{relatedMaterial.category}</span>
                                  </div>
                                </div>
                                <div className="card-body p-2">
                                  <h6 className="card-title small mb-1 text-dark">{relatedMaterial.title}</h6>
                                  <small className="text-muted">{relatedMaterial.category}</small>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-search text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2 mb-0">関連する素材はありません</p>
                        <Link href="/" className="btn btn-outline-primary btn-sm mt-2">
                          すべての素材を見る
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

// 静的生成用のパス設定
export async function getStaticPaths() {
  // 利用可能な素材IDのリスト
  const materialIds = ['cuteroom1'];
  
  const paths = materialIds.map((id) => ({
    params: { id },
  }));

  return { paths, fallback: false };
}

// 静的生成用のプロパティ設定
export async function getStaticProps({ params }) {
  const { id } = params;
  
  // デモ用のデータ（実際にはAPIやファイルから取得）
  const materials = {
    'cuteroom1': {
      id: 'cuteroom1',
      title: 'かわいい部屋 1',
      description: '温かみのあるかわいい部屋の風景。リビングスペースにソファとテーブルが配置され、暖色系の照明が心地よい雰囲気を演出しています。',
      category: '風景',
      originalPath: '/assets/landscape/cuteroom1.jpg',
      thumbnailPath: '/assets/landscape/cuteroom1.jpg',
      filename: 'cuteroom1.jpg',
      width: 1920,
      height: 1080,
      format: 'JPEG',
      license: 'CC0',
      tags: ['部屋', 'インテリア', '風景', 'かわいい', 'リビング', '家具']
    }
  };

  const material = materials[id];
  
  if (!material) {
    return {
      notFound: true,
    };
  }

  // 関連素材（デモ用）
  const relatedMaterials = [
    {
      id: 'cuteroom1',
      title: 'かわいい部屋 1',
      category: '風景',
      thumbnailPath: '/assets/landscape/cuteroom1.jpg'
    }
  ];

  return {
    props: {
      material,
      relatedMaterials,
    },
  };
}

export default MaterialDetailPage;
