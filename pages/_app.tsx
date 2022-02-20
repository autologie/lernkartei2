import "./index.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Yet another flashcard app for learning the German language"
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>Lernkartei v2</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
