import { Psbt } from "bitcoinjs-lib";
import { signPsbt as signUnisatPsbt } from "@ordzaar/ordit-sdk/unisat";

import { Network, Wallet } from "../providers/OrdConnectProvider";

interface InputsToSign {
  address: string;
  signingIndexes: number[];
  sigHash?: number;
}

export interface SignPsbtOptionsParams {
  finalize?: boolean;
  extractTx?: boolean;
  signingIndexes?: number[];
  inputsToSign?: InputsToSign[];
  sigHash?: number;
}

interface SignPsbtParams {
  address: string;
  wallet: Wallet;
  network: Network;
  psbt: Psbt;
  options?: SignPsbtOptionsParams;
}

export interface SerializedPsbt {
  hex: string;
  base64: string | null;
}

/**
 * @description accept wallet type and calls the right ordit function to sign the psbt.
 * @param wallet
 * @param network
 * @param psbt
 * @param options
 */
export default async function signPsbt({
  wallet,
  psbt,
  options,
}: SignPsbtParams): Promise<SerializedPsbt> {
  if (options?.signingIndexes?.length && options?.inputsToSign?.length) {
    throw new Error("Cannot have both indexes and inputs to sign together");
  }

  const finalize = options?.finalize ?? true;
  const extractTx = options?.extractTx ?? true;

  if (wallet === Wallet.UNISAT) {
    const signedUnisatPsbt = await signUnisatPsbt(psbt, {
      finalize,
      extractTx,
    });
    return signedUnisatPsbt;
  }

  // else throw error
  throw new Error("Invalid wallet selected");
}
