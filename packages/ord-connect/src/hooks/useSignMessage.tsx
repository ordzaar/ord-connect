import { useCallback, useState } from "react";
import { AddressFormat } from "@ordzaar/ordit-sdk";

import signMessage from "../lib/signMessage.ts";
import {
  BiAddressFormat,
  BiAddressString,
  useOrdConnect,
} from "../providers/OrdConnectProvider";

function getAddressFormat(
  address: string,
  walletAddresses: BiAddressString,
  walletFormats: BiAddressFormat,
): AddressFormat {
  const keys = Object.keys(walletAddresses) as (keyof BiAddressString)[];
  for (let i = 0; i < keys.length; i += 1) {
    if (address === walletAddresses[keys[i]]) {
      return walletFormats[keys[i]]!;
    }
  }

  throw new Error("Address does not exist");
}

export function useSignMessage(): {
  isLoading: boolean;
  signMsg: (address: string, message: string) => Promise<string | null>;
  error: string | null;
} {
  const {
    network,
    wallet,
    publicKey,
    format,
    address: walletAddresses,
  } = useOrdConnect();
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
          format: getAddressFormat(address, walletAddresses, format),
        });

        setIsLoading(false);
        return signedMessage;
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
        throw err;
      }
    },
    [format, network, publicKey, wallet, walletAddresses],
  );

  return { signMsg, error, isLoading };
}
