import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import MaterialCard from '../components/MaterialCard';

const HomePage = () => {
  const materials = [
    {
      id: "cuteroom1",
      title: "かわいい部屋 1",
      description: "温かみのあるかわいい部屋の風景",
      category: "風景",
      thumbnailUrl: "/assets/landscape/cuteroom1.jpg",
      downloadUrl: "/assets/landscape/cuteroom1.jpg",
      filename: "cuteroom1.jpg"
    }
  ];

  return (
    <>
      <Head>
        <title>フリー画像素材 - 美しい風景とかわいいイラスト</title>
        <meta name="description" content="商用利用可能なフリー画像素材サイト。美しい風景写真やかわいいイラストを無料でダウンロードできます。" />
        <meta name="keywords" content="フリー画像,無料素材,風景写真,イラスト,商用利用可能" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="フリー画像素材 - 美しい風景とかわいいイラスト" />
        <meta property="og:description" content="商用利用可能なフリー画像素材サイト。美しい風景写真やかわいいイラストを無料でダウンロードできます。" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>
      
      <Layout>
        {/* Hero Section */}
        <section className="bg-primary text-white py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold mb-3">
                  美しいフリー画像素材
                </h1>
                <p className="lead mb-4">
                  商用利用可能な高品質な画像素材を無料でダウンロード。
                  美しい風景写真やかわいいイラストが豊富に揃っています。
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-light text-dark px-3 py-2">商用利用OK</span>
                  <span className="badge bg-light text-dark px-3 py-2">クレジット表記不要</span>
                  <span className="badge bg-light text-dark px-3 py-2">高解像度</span>
                </div>
              </div>
              <div className="col-lg-6 text-center">
                <i className="fas fa-images" style={{ fontSize: '8rem', opacity: 0.3 }}></i>
              </div>
            </div>
          </div>
        </section>

        {/* Materials Section */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="text-center mb-5">最新の画像素材</h2>
              </div>
            </div>
            <div className="row">
              {materials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-light py-5">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="text-center mb-5">サイトの特徴</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 text-center mb-4">
                <div className="p-4">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">商用利用可能</h4>
                  <p className="text-muted">
                    すべての画像素材は商用利用が可能です。
                    クレジット表記も不要で自由にご利用いただけます。
                  </p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="p-4">
                  <i className="fas fa-download text-primary" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">簡単ダウンロード</h4>
                  <p className="text-muted">
                    ワンクリックで高画質な画像をダウンロード。
                    面倒な会員登録は一切不要です。
                  </p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="p-4">
                  <i className="fas fa-search text-info" style={{ fontSize: '3rem' }}></i>
                  <h4 className="mt-3">豊富なカテゴリ</h4>
                  <p className="text-muted">
                    風景、イラスト、UI素材など
                    様々なカテゴリの画像を取り揃えています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default HomePage;
