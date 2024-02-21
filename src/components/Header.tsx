import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import WebsiteContainer from "components/WebsiteContainer";
import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div>
      <WebsiteContainer>
        <div className="min-h-[100px] z-20 relative flex justify-between items-center pl-4 py-4 sm:p-4 ">
          <Link href="/">
            <div className="text-2xl lg:text-5xl font-extrabold">
              <div className="hidden sm:block">NFT Marketplace</div>
              <div className="sm:hidden">NFTs</div>
            </div>
          </Link>
          <div className="flex sm:gap-x-3 lg:gap-x-8 lg:text-2xl font-extrabold items-center">
            <Link className="hidden md:block" href="/">
              <div className="duration-300 hover:text-orange-400">Home</div>
            </Link>
            <Link href="/sell-nft">
              <div className="hidden sm:block duration-300 hover:text-orange-400">
                Sell NFT
              </div>
              <div className="sm:hidden duration-300 hover:text-orange-400">Sell</div>
            </Link>
            <div className="xl:min-w-[180px] flex justify-end">
              <ConnectButton moralisAuth={false} />
            </div>
          </div>
        </div>
      </WebsiteContainer>
      <div className="z-10 relative border-b border-orange-300" />
    </div>
  );
};

export default Header;
