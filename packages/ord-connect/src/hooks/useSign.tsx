import { useState } from "react";
import { Psbt } from "bitcoinjs-lib";

import signPsbt, {
  SerializedPsbt,
  SignPsbtOptionsParams,
} from "../lib/signPsbt";
import { useOrdContext } from "../providers/OrdContext";

export function useSign(): [
  (
    address: string,
    unsignedPsbtBase64: string,
    options: SignPsbtOptionsParams,
  ) => Promise<SerializedPsbt>,
  string | null,
  boolean,
] {
  const { network, publicKey, format, wallet } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sign = async (
    address: string,
    unsignedPsbtBase64: string,
    options: SignPsbtOptionsParams,
  ): Promise<SerializedPsbt> => {
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

      if (!signedPsbt || !signedPsbt.hex) {
        throw new Error("Signing failed.");
      }

      setLoading(false);
      return signedPsbt;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return [sign, error, loading];
}
