import { useCallback, useState } from "react";

import signMessage from "../lib/signMessage.ts";
import { useOrdConnect } from "../providers/OrdConnectProvider";

export function useSignMessage(): {
  isLoading: boolean;
  signMsg: (address: string, message: string) => Promise<string | null>;
  error: string | null;
} {
  const { network, wallet, publicKey, format } = useOrdConnect();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signMsg = useCallback(
    async (address: string, message: string) => {
      setIsLoading(true);
      try {
        setError(null);
        if (!format || !publicKey || !wallet) {
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
        setError((err as Error).message);
        setIsLoading(false);
        throw err;
      }
    },
    [format, network, publicKey, wallet],
  );

  return { signMsg, error, isLoading };
}
