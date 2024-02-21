import type { NextPage } from "next";
import {
  Card,
  Tooltip,
  Illustration,
  Modal,
  useNotification,
  Input,
  Button,
} from "web3uikit";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";

import { useMoralis, useWeb3Contract } from "react-moralis";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SellNFTModal } from "./SellNFTModal";
import { UpdateListingModal } from "./UpdateListingModal";
import { useChainId, useConnectionStatus, useContractRead } from "@thirdweb-dev/react";

interface NFTBoxProps {
  price?: number;
  nftAddress: string;
  tokenId: string;
  nftMarketplaceAddress: string;
  seller?: string;
}

const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";

  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);

  return (
    fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars)
  );
};

const NFTBox: NextPage<NFTBoxProps> = ({
  price,
  nftAddress,
  tokenId,
  nftMarketplaceAddress,
  seller,
}: NFTBoxProps) => {
  const { chainId, isWeb3Enabled, account } = useMoralis();

  const [imageURI, setImageURI] = useState<string | undefined>();
  const [tokenName, setTokenName] = useState<string | undefined>();
  const [tokenDescription, setTokenDescription] = useState<string | undefined>();

  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const isListed = seller !== undefined;

  const dispatch = useNotification();

  const {
    runContractFunction: getTokenURI,
    data: tokenURI,
    error,
  } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      "": 0,
    },
  });

  const { runContractFunction: buyItem, error: buyError } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: nftMarketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    if (tokenURI) {
      const requestURL = (tokenURI as string).replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = (imageURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }

  useEffect(() => {
    updateUI();
  }, [tokenURI]);

  useEffect(() => {
    getTokenURI();
    isWeb3Enabled && getTokenURI();
  }, [isWeb3Enabled]);

  useEffect(() => {
    // setInterval(() => {
    getTokenURI();
    // }, 1000);
  }, []);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15);

  const handleCardClick = async function () {
    if (isOwnedByUser) {
      setShowModal(true);
    } else {
      await buyItem({
        onSuccess: () => handleBuyItemSuccess(),
        onError: (error: any) => {
          console.log(error);
        },
      });
    }
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item bought successfully",
      title: "Item Bought",
      position: "topR",
    });
  };

  const tooltipContent = isListed
    ? isOwnedByUser
      ? "Update listing"
      : "Buy me"
    : "Create listing";

  return (
    // <div className="p-2 w-max mx-auto">
    <div className="p-8 sm:p-4">
      <SellNFTModal
        isVisible={showModal && !isListed}
        imageURI={imageURI}
        nftAbi={nftAbi}
        nftMarketplaceAbi={nftMarketplaceAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={nftMarketplaceAddress}
      />
      <UpdateListingModal
        isVisible={showModal && isListed}
        imageURI={imageURI}
        nftMarketplaceAbi={nftMarketplaceAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={nftMarketplaceAddress}
        currentPrice={price}
      />
      <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
        <Tooltip content={tooltipContent} position="top">
          <div className="p-2">
            {imageURI ? (
              <div className="flex flex-col items-center gap-2">
                <div>#{tokenId}</div>
                <div className="italic text-sm">Owned by {formattedSellerAddress}</div>
                <div className="w-[200px] h-[200px]">
                  <Image src={imageURI} alt="" height="200" width="200" />
                </div>
                {price && (
                  <div className="font-bold">{ethers.utils.formatEther(price)} ETH</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Illustration height="180px" logo="lazyNft" width="100%" />
                Loading...
              </div>
            )}
          </div>
        </Tooltip>
      </Card>
    </div>
  );
};
export default NFTBox;
