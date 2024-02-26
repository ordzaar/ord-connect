import { signPsbt as signLeatherPsbt } from "@ordzaar/ordit-sdk/leather";
import { signPsbt as signMagicEdenPsbt } from "@ordzaar/ordit-sdk/magiceden";
import { signPsbt as signUnisatPsbt } from "@ordzaar/ordit-sdk/unisat";
import { signPsbt as signXversePsbt } from "@ordzaar/ordit-sdk/xverse";
import { Psbt } from "bitcoinjs-lib";

import { Network, Wallet } from "../providers/OrdConnectProvider";

export interface SignPsbtOptionsParams {
  finalize?: boolean;
  extractTx?: boolean;
  signingIndexes?: number[];
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
  address,
  wallet,
  network,
  psbt,
  options,
}: SignPsbtParams): Promise<SerializedPsbt> {
  const finalize = options?.finalize ?? true;
  const extractTx = options?.extractTx ?? true;
  const getAllInputIndices = () =>
    psbt.data.inputs.map((value, index) => index);

  if (wallet === Wallet.MAGICEDEN) {
    const signedMagicEdenPsbt = await signMagicEdenPsbt(psbt, {
      network,
      inputsToSign: [
        {
          address,
          signingIndexes: options?.signingIndexes ?? getAllInputIndices(), // If signingIndexes is not provided, just sign everything
          sigHash: options?.sigHash,
        },
      ],
      finalize,
      extractTx,
    });
    return signedMagicEdenPsbt;
  }

  if (wallet === Wallet.UNISAT) {
    const signedUnisatPsbt = await signUnisatPsbt(psbt, {
      finalize,
      extractTx,
    });
    return signedUnisatPsbt;
  }

  if (wallet === Wallet.XVERSE) {
    const signedXversePsbt = await signXversePsbt(psbt, {
      network,
      inputsToSign: [
        {
          address,
          signingIndexes: options?.signingIndexes ?? getAllInputIndices(), // If signingIndexes is not provided, just sign everything
          sigHash: options?.sigHash,
        },
      ],
      finalize,
      extractTx,
    });
    return signedXversePsbt;
  }

  if (wallet === Wallet.LEATHER) {
    const signedLeatherPsbt = await signLeatherPsbt(psbt, {
      network,
      finalize,
      extractTx,
      allowedSighash: options?.sigHash ? [options?.sigHash] : [],
      signAtIndexes: options?.signingIndexes ?? getAllInputIndices(), // If signingIndexes is not provided, just sign everything
    });
    return signedLeatherPsbt;
  }
  // else throw error
  throw new Error("Invalid wallet selected");
}
