interface Address {
  address: string;
  format: string;
  pub: string;
}

export interface GetWalletModel {
  data: {
    addresses: Address[];
    counts: {
      addresses: number;
    };
    keys: Address[];
  };
  message: string;
  success: boolean;
}
