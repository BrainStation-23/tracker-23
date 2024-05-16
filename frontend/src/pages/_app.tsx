import type { AppProps } from "next/app";
import Layout from "@/components/layout";

import { Providers } from "@/storage/redux/provider";

import "@/styles/globals.css";
import '@/styles/DatePicker.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
