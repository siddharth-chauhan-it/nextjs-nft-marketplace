import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Header from "components/Header";
import WebsiteContainer from "components/WebsiteContainer";

import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import { useChainId, useConnectionStatus } from "@thirdweb-dev/react";
import NFTBox from "components/NFTBox";
import { MoralisProvider, useMoralis } from "react-moralis";
import { nftInterface, contractAddressesInterface } from "../interfaces";
// Browser Detection
const isBrowser = typeof window !== "undefined";

const Home: NextPage = () => {
  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);
  const { chainId, isWeb3Enabled } = useMoralis();

  const addresses: contractAddressesInterface = networkMapping;
  const marketplaceAddress = chainId
    ? addresses[parseInt(chainId!).toString()]["NftMarketplace"][0]
    : null;

  // const [windowWidth, setWindowWidth] = useState(Number(isBrowser && window.innerWidth));

  // useEffect(() => {
  //   window.addEventListener("resize", () => {
  //     setWindowWidth(window.innerWidth);
  //   });
  // }, []);

  return (
    <div id="page" className="overflow-hidden relative z-10">
      <div>
        <WebsiteContainer>
          <div>
            <div className="">
              <h1 className="py-4 px-4 font-bold text-2xl">
                {isWeb3Enabled ? "Recently Listed" : "Please Connect Metamask"}
              </h1>
              <div className="px-4">
                {isWeb3Enabled && (
                  // <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-x-4">
                  <div className="flex flex-wrap">
                    {loading || !listedNfts ? (
                      <div>Loading...</div>
                    ) : (
                      listedNfts.activeItems.map((nft: nftInterface /*, index*/) => {
                        const { price, nftAddress, tokenId, seller } = nft;

                        return (
                          <NFTBox
                            key={`${nftAddress}${tokenId}`}
                            price={price}
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            nftMarketplaceAddress={marketplaceAddress!}
                            seller={seller}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </WebsiteContainer>
      </div>
    </div>
  );
};

export default Home;
