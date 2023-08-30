import { useState } from "react";
import { Psbt } from "bitcoinjs-lib";
import { useSadoContext } from "../providers/SadoContext";
import signPsbt, { SignPsbtOptionsParams } from "../lib/signPsbt";

interface SignedPsbt {
  rawTxHex: string;
  psbt: {
    hex: string;
    base64: string;
  };
}

export function useSign(): [
  (
    address: string,
    unsignedPsbtBase64: string,
    options: SignPsbtOptionsParams,
  ) => Promise<SignedPsbt>,
  string | null,
  boolean,
] {
  const { network, publicKey, format, wallet } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sign = async (
    address: string,
    unsignedPsbtBase64: string,
    options: SignPsbtOptionsParams,
  ): Promise<SignedPsbt> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }

      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);

      const signedPsbt = await signPsbt({
        address,
        wallet,
        network,
        psbt: unsignedPsbt,
        options,
      });

      if (!signedPsbt || !signedPsbt.rawTxHex) {
        throw new Error("Signing failed.");
      }

      setLoading(false);
      return signedPsbt;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw new Error(err);
    }
  };

  return [sign, error, loading];
}
