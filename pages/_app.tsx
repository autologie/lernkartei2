import "./_app.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="A flashcard app for building German language vocabulary"
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>Lernkartei</title>
      </Head>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-4V62MH7H80"
      ></Script>
      <Script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-4V62MH7H80');`,
        }}
      ></Script>
      <Component {...pageProps} />
    </>
  );
}
