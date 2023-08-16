import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";
import { ordit } from "@sadoprotocol/ordit-sdk";
import { Psbt } from "bitcoinjs-lib";

interface SignedPsbt {
  rawTxHex: string;
  psbt: {
    hex: string;
    base64: string;
  };
}

interface SignOptions {
  finalize?: boolean;
  extractTx?: boolean;
}

export function useSign(): [
  (unsignedPsbtBase64: string, options: SignOptions) => Promise<SignedPsbt>,
  string | null,
  boolean
] {
  const { network, publicKey, format, wallet } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sign = async (
    unsignedPsbtBase64: string,
    options: SignOptions
  ): Promise<SignedPsbt> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) throw new Error("No wallet is connected");

      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);

      let signedPsbt: SignedPsbt;

      if (wallet === Wallet.UNISAT) {
        signedPsbt = await ordit.unisat.signPsbt(unsignedPsbt, options);
      } else if (wallet === Wallet.XVERSE) {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          inputs: [],
        };
        signedPsbt = await ordit.xverse.signPsbt(xverseSignPsbtOptions);
      } else {
        throw new Error("No wallet selected");
      }
      if (!signedPsbt || !signedPsbt.rawTxHex) {
        throw new Error("Signing failed.");
      }
      setLoading(false);
      return signedPsbt;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return [sign, error, loading];
}
