import { ordit } from "@sadoprotocol/ordit-sdk";
import { Network, Wallet } from "../providers/OrdContext.tsx";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string | Record<string, string>;
  network: Network;
}

export default async function getSignedMessage({
  message,
  wallet,
  address,
  network,
}: SignMessageParams) {
  if (wallet === Wallet.UNISAT) {
    const signedMessage = await ordit.unisat.signMessage(message);
    return signedMessage.base64;
  }

  if (wallet === Wallet.XVERSE) {
    let xverseAddress = address as string;
    if (typeof address === "object") {
      xverseAddress = address.ordinals;
    }

    // Todo: remove any type fixes in ordit-sdk is done
    const signedMessage: any = await ordit.xverse.signMessage({
      address: xverseAddress,
      network,
      message,
    });

    return signedMessage.signature;
  }

  // else throw error
  throw new Error("Invalid wallet selected");
}
