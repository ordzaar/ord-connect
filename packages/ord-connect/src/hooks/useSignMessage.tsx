import { useState } from "react";

import signMessage from "../lib/signMessage.ts";
import { useOrdContext } from "../providers/OrdContext";

export function useSignMessage(): {
  isLoading: boolean;
  signMsg: (address: string, message: string) => Promise<string>;
  error: string;
} {
  const { network, wallet, publicKey, format } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signMsg = async (address: string, message: string) => {
    setIsLoading(true);
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

      setIsLoading(false);
      return signedMessage;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return { signMsg, error, isLoading };
}
