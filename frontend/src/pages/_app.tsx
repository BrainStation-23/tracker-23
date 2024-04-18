import { Providers } from "@/storage/redux/provider";

import type { AppProps } from "next/app";
import Layout from "@/components/layout";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
