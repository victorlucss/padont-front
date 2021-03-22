import Head from "next/head";
import "styles/_reset.scss";

import { GlobalStyle } from "styles";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Padont</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,700;1,400&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
