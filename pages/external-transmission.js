import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const ExternalTransmissionPage = () => {
  return (
    <>
      <Head>
        <title>外部送信について - フリー画像素材</title>
        <meta name="description" content="フリー画像素材で使用している外部サービスへの情報送信について詳しく説明しています。" />
        <meta name="keywords" content="外部送信,Cookie,プライバシー,個人情報" />
      </Head>
      
      <Layout>
        {/* ページヘッダー */}
        <section className="bg-info text-white py-5">
          <div className="container text-center">
            <h1 className="display-5 fw-bold mb-3">
              <i className="fas fa-external-link-alt"></i> 外部送信について
            </h1>
            <p className="lead mb-0">第三者サービスへの情報送信に関する詳細</p>
          </div>
        </section>

        {/* メインコンテンツ */}
        <main className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                
                {/* 最終更新日 */}
                <div className="alert alert-info">
                  <i className="fas fa-calendar"></i> 最終更新日：2025年9月1日
                </div>

                {/* 概要 */}
                <div className="mb-5">
                  <h3 className="text-info pb-2 border-bottom border-2">概要</h3>
                  <p>当サイト「フリー画像素材」では、サイトの機能向上や利便性の提供のため、以下の外部サービスを利用し、これらのサービスに対して情報を送信しています。</p>
                  <p>電気通信事業法の改正（2023年6月16日施行）に基づき、外部送信される情報について詳細をお知らせします。</p>
                </div>

                {/* 外部送信する情報の一覧 */}
                <div className="mb-5">
                  <h3 className="text-info pb-2 border-bottom border-2">外部送信する情報の詳細</h3>
                  
                  {/* Google Analytics */}
                  <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                      <h4 className="mb-0">
                        <i className="fas fa-chart-bar me-2"></i> Google Analytics（アクセス解析）
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>送信される情報</h5>
                          <ul>
                            <li>Cookie識別子</li>
                            <li>IPアドレス（匿名化済み）</li>
                            <li>閲覧ページのURL</li>
                            <li>リファラー（参照元）</li>
                            <li>デバイス情報</li>
                            <li>ブラウザ情報</li>
                            <li>画面解像度</li>
                            <li>サイト滞在時間</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h5>利用目的</h5>
                          <ul>
                            <li>ウェブサイトのパフォーマンス分析</li>
                            <li>ユーザー行動の理解</li>
                            <li>コンテンツ改善</li>
                            <li>サイト利用状況の把握</li>
                          </ul>
                          <p><strong>送信先：</strong> Google LLC</p>
                          <p><small><a href="https://policies.google.com/privacy" target="_blank" className="text-decoration-none">Googleプライバシーポリシー</a></small></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google AdSense */}
                  <div className="card mb-4">
                    <div className="card-header bg-success text-white">
                      <h4 className="mb-0">
                        <i className="fas fa-ad me-2"></i> Google AdSense（広告配信）
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>送信される情報</h5>
                          <ul>
                            <li>Cookie識別子</li>
                            <li>IPアドレス</li>
                            <li>ユーザーエージェント</li>
                            <li>リファラー情報</li>
                            <li>閲覧ページ情報</li>
                            <li>広告の表示・クリック情報</li>
                            <li>デバイス情報</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h5>利用目的</h5>
                          <ul>
                            <li>パーソナライズ広告の配信</li>
                            <li>広告の表示回数制御</li>
                            <li>不正クリックの検出</li>
                            <li>広告効果の測定</li>
                          </ul>
                          <p><strong>送信先：</strong> Google LLC</p>
                          <p><small><a href="https://policies.google.com/technologies/ads" target="_blank" className="text-decoration-none">Google広告ポリシー</a></small></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bootstrap CDN */}
                  <div className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      <h4 className="mb-0">
                        <i className="fas fa-code me-2"></i> Bootstrap CDN（UI フレームワーク）
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>送信される情報</h5>
                          <ul>
                            <li>IPアドレス</li>
                            <li>ユーザーエージェント</li>
                            <li>リファラー情報</li>
                            <li>アクセス日時</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h5>利用目的</h5>
                          <ul>
                            <li>CSSファイルの配信</li>
                            <li>JavaScriptファイルの配信</li>
                            <li>サイトデザインの表示</li>
                          </ul>
                          <p><strong>送信先：</strong> jsDelivr CDN</p>
                          <p><small><a href="https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net" target="_blank" className="text-decoration-none">jsDelivrプライバシーポリシー</a></small></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font Awesome */}
                  <div className="card mb-4">
                    <div className="card-header bg-warning text-dark">
                      <h4 className="mb-0">
                        <i className="fas fa-icons me-2"></i> Font Awesome（アイコンフォント）
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>送信される情報</h5>
                          <ul>
                            <li>IPアドレス</li>
                            <li>ユーザーエージェント</li>
                            <li>リファラー情報</li>
                            <li>アクセス日時</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h5>利用目的</h5>
                          <ul>
                            <li>アイコンフォントの配信</li>
                            <li>サイトアイコンの表示</li>
                          </ul>
                          <p><strong>送信先：</strong> Cloudflare</p>
                          <p><small><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" className="text-decoration-none">Cloudflareプライバシーポリシー</a></small></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 情報送信の停止方法 */}
                <div className="mb-5">
                  <h3 className="text-info pb-2 border-bottom border-2">情報送信の停止方法</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <h5>Cookieの無効化</h5>
                      <p>ブラウザの設定でCookieを無効にすることができます：</p>
                      <ul>
                        <li>Chrome: 設定 → プライバシーとセキュリティ → Cookie</li>
                        <li>Firefox: 設定 → プライバシーとセキュリティ</li>
                        <li>Safari: 設定 → プライバシー</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5>広告のオプトアウト</h5>
                      <ul>
                        <li><a href="https://adssettings.google.com/authenticated" target="_blank" className="text-decoration-none">Google広告設定</a>でパーソナライズ広告を無効化</li>
                        <li><a href="https://optout.aboutads.info/" target="_blank" className="text-decoration-none">DAA WebChoices</a>で興味関心に基づく広告を拒否</li>
                        <li><a href="https://youronlinechoices.eu/" target="_blank" className="text-decoration-none">Your Online Choices</a>（EU向け）</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="mb-5">
                  <h3 className="text-info pb-2 border-bottom border-2">注意事項</h3>
                  <div className="alert alert-warning">
                    <ul className="mb-0">
                      <li>Cookieを無効にした場合、サイトの一部機能が正常に動作しない可能性があります</li>
                      <li>外部サービスの仕様変更により、送信される情報が変更される場合があります</li>
                      <li>各外部サービスのプライバシーポリシーもあわせてご確認ください</li>
                    </ul>
                  </div>
                </div>

                {/* 更新について */}
                <div className="mb-5">
                  <h3 className="text-info pb-2 border-bottom border-2">この情報の更新について</h3>
                  <p>外部送信に関する情報は、サービスの追加・変更・削除に伴い更新される場合があります。重要な変更がある場合は、当ページでお知らせいたします。</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default ExternalTransmissionPage;
