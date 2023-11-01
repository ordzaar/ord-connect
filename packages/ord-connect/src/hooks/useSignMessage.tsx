import { useState } from "react";
import { useOrdContext } from "../providers/OrdContext.tsx";
import signMessage from "../lib/signMessage.ts";

export function useSignMessage(): [
  (address, message) => Promise<string>,
  string,
  boolean,
] {
  const { network, wallet, publicKey, format } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signMsg = async (address, message) => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }

      const signedMessage = await signMessage({
        address,
        wallet,
        message,
        network,
      });

      return signedMessage;
    } catch (e) {
      setError(e.message);
      setLoading(false);
      throw new Error(e);
    }
  };

  return [signMsg, error, loading];
}
