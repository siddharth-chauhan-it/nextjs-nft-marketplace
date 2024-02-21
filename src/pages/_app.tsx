import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "components/Header";

import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  // uri: "https://api.studio.thegraph.com/query/66042/nft-marketplace/v0.0.2",
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        // activeChain={""}
        supportedWallets={[
          metamaskWallet({
            recommended: true,
          }),
          coinbaseWallet(),
          walletConnect(),
        ]}
      >
        <MoralisProvider initializeOnMount={false}>
          <ApolloProvider client={client}>
            <NotificationProvider>
              <Header />
              <Component {...pageProps} />
            </NotificationProvider>
          </ApolloProvider>
        </MoralisProvider>
      </ThirdwebProvider>
    </div>
  );
}
