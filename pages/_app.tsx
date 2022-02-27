import "./_app.css";
import type { AppProps } from "next/app";
import Head from "next/head";

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
      <Component {...pageProps} />
    </>
  );
}
