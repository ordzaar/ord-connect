import { ordit } from "@sadoprotocol/ordit-sdk";

import { Network, Wallet } from "../providers/OrdContext.tsx";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string;
  network: Network;
}

// returns based64 signature
export default async function signMessage({
  message,
  wallet,
  address,
  network,
}: SignMessageParams): Promise<string> {
  if (wallet === Wallet.UNISAT) {
    const signedMessage = await ordit.unisat.signMessage(message);
    return signedMessage.base64;
  }

  if (wallet === Wallet.XVERSE) {
    // Todo: remove any type fixes in ordit-sdk is done
    const signedMessage: any = await ordit.xverse.signMessage({
      address,
      network,
      message,
    });

    return signedMessage.signature;
  }

  // else throw error
  throw new Error("Invalid wallet selected");
}
