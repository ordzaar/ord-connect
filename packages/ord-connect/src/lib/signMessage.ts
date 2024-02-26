import { AddressFormat } from "@ordzaar/ordit-sdk";
import {
  LeatherAddressType,
  signMessage as signLeatherMessage,
} from "@ordzaar/ordit-sdk/leather";
import { signMessage as signMagicEdenMessage } from "@ordzaar/ordit-sdk/magiceden";
import { signMessage as signUnisatMessage } from "@ordzaar/ordit-sdk/unisat";
import { signMessage as signXverseMessage } from "@ordzaar/ordit-sdk/xverse";

import { Network, Wallet } from "../providers/OrdConnectProvider";

interface SignMessageParams {
  message: string;
  wallet: Wallet;
  address: string;
  network: Network;
  format: AddressFormat;
}

function leatherPaymentTypeFromFormat(
  format: AddressFormat,
): LeatherAddressType {
  if (format === "segwit") {
    return LeatherAddressType.P2WPKH;
  }
  if (format === "taproot") {
    return LeatherAddressType.P2TR;
  }
  throw new Error("Leather payment address format is not supported");
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
  format,
}: SignMessageParams): Promise<string | null> {
  if (wallet === Wallet.MAGICEDEN) {
    const { base64 } = await signMagicEdenMessage(message, address, network);
    return base64;
  }

  if (wallet === Wallet.UNISAT) {
    const { base64 } = await signUnisatMessage(message, "bip322-simple");
    return base64;
  }

  if (wallet === Wallet.XVERSE) {
    const { base64 } = await signXverseMessage(message, address, network);
    return base64;
  }

  if (wallet === Wallet.LEATHER) {
    const paymentType = leatherPaymentTypeFromFormat(format);
    const { base64 } = await signLeatherMessage(message, {
      paymentType,
      network,
    });
    return base64;
  }

  throw new Error("Invalid wallet selected");
}
