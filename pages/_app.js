import Head from "next/head";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Arketype | Build Smarter with AI-Optimized Prompts</title>
        <meta
          name="description"
          content="Arketype helps you ship faster with curated AI prompt packs for every workflow."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </>
  );
}
