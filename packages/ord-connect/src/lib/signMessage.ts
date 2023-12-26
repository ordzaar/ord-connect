import { signMessage as signUnisatMessage } from "@ordzaar/ordit-sdk/unisat";
import { signMessage as signXverseMessage } from "@ordzaar/ordit-sdk/xverse";

import { Network, Wallet } from "../providers/OrdConnectProvider";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string;
  network: Network;
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
}: SignMessageParams): Promise<string | null> {
  if (wallet === Wallet.UNISAT) {
    const { base64 } = await signUnisatMessage(message, "bip322-simple");
    return base64;
  }

  if (wallet === Wallet.XVERSE) {
    const { base64 } = await signXverseMessage(message, address, network);
    return base64;
  }

  throw new Error("Invalid wallet selected");
}
