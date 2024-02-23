import {
  LeatherAddressType,
  signMessage as signLeatherMessage,
} from "@ordzaar/ordit-sdk/leather";
import { signMessage as signUnisatMessage } from "@ordzaar/ordit-sdk/unisat";
import { signMessage as signXverseMessage } from "@ordzaar/ordit-sdk/xverse";

import {
  BiAddressString,
  Network,
  Wallet,
} from "../providers/OrdConnectProvider";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string;
  network: Network;
  walletAddresses: BiAddressString;
}

/**
 * Sign message
 *
 * @param options Options
 * @returns base64 signature
 */
export default async function signMessage({
  message,
  wallet,
  address,
  network,
  walletAddresses,
}: SignMessageParams): Promise<string | null> {
  if (wallet === Wallet.UNISAT) {
    const { base64 } = await signUnisatMessage(message, "bip322-simple");
    return base64;
  }

  if (wallet === Wallet.XVERSE) {
    const { base64 } = await signXverseMessage(message, address, network);
    return base64;
  }

  if (wallet === Wallet.LEATHER) {
    const paymentType =
      walletAddresses.ordinals === address
        ? LeatherAddressType.P2TR
        : LeatherAddressType.P2WPKH;
    const { base64 } = await signLeatherMessage(message, {
      paymentType,
      network,
    });
    return base64;
  }

  throw new Error("Invalid wallet selected");
}
