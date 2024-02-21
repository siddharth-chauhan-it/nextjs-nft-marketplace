import Head from "next/head";
import Image from "next/image";
import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";
import { nftInterface, contractAddressesInterface } from "../interfaces";
import WebsiteContainer from "@/components/WebsiteContainer";

export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const addresses: contractAddressesInterface = networkMapping;
  const marketplaceAddress = chainId
    ? addresses[parseInt(chainId!).toString()]["NftMarketplace"][0]
    : "";

  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data: any) {
    console.log("Approving...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(
    tx: any,
    nftAddress: string,
    tokenId: string,
    price: string
  ) {
    await tx.wait();
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess() {
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    });
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    setupUI();
  }, [proceeds, account, isWeb3Enabled, chainId]);

  return (
    <WebsiteContainer>
      <div className="">
        {!isWeb3Enabled ? (
          <h1 className="py-4 px-4 font-bold text-2xl">Please Connect Metamask</h1>
        ) : (
          <div className="px-4">
            <div className="py-4 xl:w-[50%]">
              <Form
                onSubmit={approveAndList}
                data={[
                  {
                    name: "NFT Address",
                    type: "text",
                    inputWidth: "60%",
                    value: "",
                    key: "nftAddress",
                  },
                  {
                    name: "Token ID",
                    type: "number",
                    inputWidth: "30%",
                    value: "",
                    key: "tokenId",
                  },
                  {
                    name: "Price (in ETH)",
                    type: "number",
                    inputWidth: "30%",
                    value: "",
                    key: "price",
                  },
                ]}
                title="Sell your NFT!"
                id="Main Form"
              />
            </div>
            {proceeds == "0" ? (
              <>
                <div className="pb-4">
                  Sales proceeds available for withdrawal:{" "}
                  {ethers.utils.formatEther(proceeds)} ETH
                </div>
                <Button
                  onClick={() => {
                    runContractFunction({
                      params: {
                        abi: nftMarketplaceAbi,
                        contractAddress: marketplaceAddress,
                        functionName: "withdrawProceeds",
                        params: {},
                      },
                      onError: (error) => console.log(error),
                      onSuccess: () => handleWithdrawSuccess,
                    });
                  }}
                  text="Withdraw"
                  type="button"
                />
              </>
            ) : (
              <div>No proceeds detected</div>
            )}
          </div>
        )}
      </div>
    </WebsiteContainer>
  );
}
