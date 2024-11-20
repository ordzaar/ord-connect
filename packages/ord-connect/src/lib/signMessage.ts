import { AddressFormat } from "@ordzaar/ordit-sdk";
import { signMessage as signUnisatMessage } from "@ordzaar/ordit-sdk/unisat";

import { Network, Wallet } from "../providers/OrdConnectProvider";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string;
  network: Network;
  format: AddressFormat;
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
}: SignMessageParams): Promise<string | null> {
  if (wallet === Wallet.UNISAT) {
    const { base64 } = await signUnisatMessage(message, "bip322-simple");
    return base64;
  }
  throw new Error("Invalid wallet selected");
}
