import Head from "next/head";
import "styles/_reset.scss";

import { GlobalStyle } from "styles";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Padont</title>
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
