import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://cdn.anychart.com/releases/v8/js/anychart-base.min.js"
        type="text/typescript"
      />
      <Component {...pageProps} />
    </>
  );
}
