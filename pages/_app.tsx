import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
          rel="stylesheet" 
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
