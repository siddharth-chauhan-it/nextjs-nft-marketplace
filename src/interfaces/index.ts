export interface nftInterface {
  price: number;
  nftAddress: string;
  tokenId: string;
  address: string;
  seller: string;
}
export interface contractAddressesInterface {
  [key: string]: contractAddressesItemInterface;
}

export interface contractAddressesItemInterface {
  [key: string]: string[];
}
