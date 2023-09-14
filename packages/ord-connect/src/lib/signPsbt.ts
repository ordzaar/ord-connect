import { Psbt } from "bitcoinjs-lib";
import { ordit } from "@sadoprotocol/ordit-sdk";
import { Network, Wallet } from "../providers/OrdContext.tsx";

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
  base64: string;
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

  if (wallet === Wallet.UNISAT) {
    const signedUnisatPsbt = await ordit.unisat.signPsbt(psbt, {
      finalize,
      extractTx,
    });
    return signedUnisatPsbt;
  }

  if (wallet === Wallet.XVERSE) {
    const getAllInputIndices = () =>
      psbt.data.inputs.map((value, index) => index);
    const xverseSignPsbtOptions = {
      psbt,
      network,
      inputs: [
        {
          address,
          signingIndexes: options?.signingIndexes ?? getAllInputIndices(), // If signingIndexes is not provided, just sign everything
          sigHash: options?.sigHash,
        },
      ],
      finalize,
      extractTx,
    };
    const signedXversePsbt = await ordit.xverse.signPsbt(xverseSignPsbtOptions);
    return signedXversePsbt;
  }
  // else throw error
  throw new Error("Invalid wallet selected");
}
