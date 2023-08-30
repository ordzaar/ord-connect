import { Psbt } from "bitcoinjs-lib";
import { ordit } from "@sadoprotocol/ordit-sdk";
import { Network, Wallet } from "../providers/SadoContext";

export interface SignPsbtOptionsParams {
  finalize?: boolean;
  extractTx?: boolean;
  signingIndexes?: number[];
}

interface SignPsbtParams {
  address: string;
  wallet: Wallet;
  network: Network;
  psbt: Psbt;
  options?: SignPsbtOptionsParams;
}

interface SignPsbtReturn {
  rawTxHex: string | null;
  psbt: {
    hex: string;
    base64: string;
  };
}

/**
 * @description accept wallet type and calls the right ordit function to sign the psbt.
 * @param wallet
 * @param network``
 * @param psbt
 * @param options
 */
export default async function signPsbt({
  address,
  wallet,
  network,
  psbt,
  options,
}: SignPsbtParams): Promise<SignPsbtReturn> {
  const finalize = options?.finalize ?? true;
  const extractTx = options?.extractTx ?? true;

  if (wallet === Wallet.UNISAT) {
    const signedUnisatPsbt = await ordit.unisat.signPsbt(psbt, {
      finalize,
      extractTx,
    });
    return {
      rawTxHex: signedUnisatPsbt.rawTxHex,
      psbt: {
        hex: signedUnisatPsbt.psbt.hex,
        base64: signedUnisatPsbt.psbt.base64,
      },
    };
  }
  if (wallet === Wallet.XVERSE) {
    const xverseSignPsbtOptions = {
      psbt,
      network,
      inputs: [
        {
          address,
          signingIndexes:
            options?.signingIndexes ??
            psbt.data.inputs.map((value, index) => index), // If signingIndexes is not provided, just sign everything
        },
      ],
      finalize,
      extractTx,
    };
    const signedXversePsbt = await ordit.xverse.signPsbt(xverseSignPsbtOptions);
    return {
      rawTxHex: signedXversePsbt.rawTxHex,
      psbt: {
        hex: signedXversePsbt.psbt.hex,
        base64: signedXversePsbt.psbt.base64,
      },
    };
  }
  // else throw error
  throw new Error("Invalid wallet selected");
}
