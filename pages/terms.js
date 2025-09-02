import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>利用規約 - フリー画像素材</title>
        <meta name="description" content="フリー画像素材の利用規約。素材の利用方法、禁止事項、著作権について説明しています。" />
        <meta name="keywords" content="利用規約,利用条件,著作権,商用利用,禁止事項" />
      </Head>
      
      <Layout>
        {/* ページヘッダー */}
        <section className="bg-success text-white py-5">
          <div className="container text-center">
            <h1 className="display-5 fw-bold mb-3">
              <i className="fas fa-file-contract"></i> 利用規約
            </h1>
            <p className="lead mb-0">素材利用に関する規約と条件</p>
          </div>
        </section>

        {/* メインコンテンツ */}
        <main className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                
                {/* 最終更新日 */}
                <div className="alert alert-success">
                  <i className="fas fa-calendar"></i> 最終更新日：2025年9月1日
                </div>

                {/* 基本方針 */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">基本方針</h3>
                  <p>「フリー画像素材」（以下「当サイト」）が提供する素材は、CC0ライセンス（パブリックドメイン）に基づいて配布されています。本利用規約は、当サイトの利用に関する条件を定めるものです。</p>
                </div>

                {/* ライセンス */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">ライセンスについて</h3>
                  <div className="card border-start border-success border-4 bg-light p-4">
                    <h4><i className="fas fa-creative-commons"></i> CC0 ライセンス（パブリックドメイン）</h4>
                    <p>当サイトで提供される素材は、原則としてCC0ライセンスが適用されます。これにより以下が可能です：</p>
                    <div className="row">
                      <div className="col-md-6">
                        <h6><i className="fas fa-check-circle text-success"></i> 許可される利用</h6>
                        <ul>
                          <li>商用利用</li>
                          <li>非商用利用</li>
                          <li>改変・加工</li>
                          <li>再配布</li>
                          <li>印刷物への利用</li>
                          <li>Webサイトでの利用</li>
                          <li>デザイン素材としての利用</li>
                          <li>二次創作での利用</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <h6><i className="fas fa-info-circle text-info"></i> 特記事項</h6>
                        <ul>
                          <li>著作者の表示は不要</li>
                          <li>許可を求める必要なし</li>
                          <li>利用報告は不要</li>
                          <li>クレジット表記は任意</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 禁止事項 */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">禁止事項</h3>
                  <div className="alert alert-danger">
                    <h5><i className="fas fa-exclamation-triangle"></i> 以下の利用は禁止されています</h5>
                    <ul className="mb-0">
                      <li><strong>公序良俗に反する利用：</strong>反社会的、差別的、アダルト、暴力的なコンテンツでの利用</li>
                      <li><strong>法令違反：</strong>法律や規制に違反する目的での利用</li>
                      <li><strong>他者の権利侵害：</strong>第三者の権利を侵害する目的での利用</li>
                      <li><strong>素材の再販売：</strong>素材そのものを商品として販売すること</li>
                      <li><strong>競合サイトでの利用：</strong>類似のフリー素材サイトでの配布</li>
                      <li><strong>悪意のある利用：</strong>当サイトや他者に損害を与える目的での利用</li>
                    </ul>
                  </div>
                </div>

                {/* 著作権について */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">著作権について</h3>
                  <ul>
                    <li>当サイトの素材は、運営者が作成・撮影したオリジナル作品です</li>
                    <li>CC0ライセンスにより、著作権は放棄されています</li>
                    <li>ただし、素材に含まれる人物の肖像権、建物の所有権等は別途保護されます</li>
                    <li>第三者の権利が関わる可能性がある素材については、利用者の責任で確認してください</li>
                  </ul>
                </div>

                {/* 免責事項 */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">免責事項</h3>
                  <ul>
                    <li>当サイトの素材利用により生じた損害について、運営者は一切の責任を負いません</li>
                    <li>素材の品質、正確性、完全性について保証いたしません</li>
                    <li>素材の利用は利用者の自己責任で行ってください</li>
                    <li>素材のダウンロードや利用により、コンピュータウイルス等の感染があっても責任を負いません</li>
                  </ul>
                </div>

                {/* サイト利用について */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">サイト利用について</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <h5>利用条件</h5>
                      <ul>
                        <li>18歳未満の方は保護者の同意が必要</li>
                        <li>法的能力を有すること</li>
                        <li>本規約に同意すること</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5>禁止行為</h5>
                      <ul>
                        <li>サーバーに過度な負荷をかける行為</li>
                        <li>不正アクセスやデータの改ざん</li>
                        <li>他の利用者への迷惑行為</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* プライバシーについて */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">プライバシーについて</h3>
                  <p>当サイトのプライバシーポリシーについては、<Link href="/privacy-policy" className="text-decoration-none">プライバシーポリシーページ</Link>をご確認ください。</p>
                </div>

                {/* 規約の変更 */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">規約の変更</h3>
                  <ul>
                    <li>当利用規約は、事前の予告なく変更される場合があります</li>
                    <li>変更後の利用規約は、当ページに掲載された時点で効力を発します</li>
                    <li>重要な変更については、サイト上で告知いたします</li>
                  </ul>
                </div>

                {/* 準拠法・管轄裁判所 */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">準拠法・管轄裁判所</h3>
                  <ul>
                    <li>本規約は日本国法に準拠します</li>
                    <li>当サイトに関する紛争については、運営者の所在地を管轄する地方裁判所を専属的合意管轄とします</li>
                  </ul>
                </div>

                {/* お問い合わせ */}
                <div className="mb-5">
                  <h3 className="text-success pb-2 border-bottom border-2">お問い合わせ</h3>
                  <p>本利用規約に関するご質問やお問い合わせは、サイト運営者までご連絡ください。</p>
                </div>

                {/* 利用開始について */}
                <div className="alert alert-primary">
                  <h5><i className="fas fa-handshake"></i> 利用開始について</h5>
                  <p className="mb-0">当サイトの素材をダウンロードまたは利用した時点で、本利用規約に同意したものとみなします。</p>
                </div>

              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default TermsPage;
