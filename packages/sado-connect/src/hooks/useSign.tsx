import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";
import { ordit } from "@sadoprotocol/ordit-sdk";
import { Psbt } from "bitcoinjs-lib";

export function useSign(): [
  (unsignedPsbtBase64: string) => Promise<string>,
  string | null,
  boolean
] {
  const { network, publicKey, format, wallet } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sign = async (unsignedPsbtBase64: string): Promise<string> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) throw new Error("No wallet is connected");

      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);

      let signedPsbtBase64: string;

      if (wallet === Wallet.UNISAT) {
        const signedUnisatPsbt = await ordit.unisat.signPsbt(unsignedPsbt);
        signedPsbtBase64 = signedUnisatPsbt.psbt.base64;
      } else if (wallet === Wallet.XVERSE) {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          inputs: [],
        };
        const signedXversePsbt = await ordit.xverse.signPsbt(
          xverseSignPsbtOptions
        );
        signedPsbtBase64 = signedXversePsbt.psbt.base64;
      } else {
        throw new Error("No wallet selected");
      }
      if (!signedPsbtBase64) {
        throw new Error("Signing failed.");
      }
      setLoading(false);
      return signedPsbtBase64;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return [sign, error, loading];
}
