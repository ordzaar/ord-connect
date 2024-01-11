import { useCallback, useState } from "react";
import { PSBTBuilder } from "@ordzaar/ordit-sdk";

import signPsbt, { SerializedPsbt } from "../lib/signPsbt";
import { useOrdConnect } from "../providers/OrdConnectProvider";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate: number,
) => Promise<SerializedPsbt | null>;

export function useSend() {
  const { wallet, network, address, publicKey } = useOrdConnect();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const send: SendFunction = useCallback(
    async (toAddress, satoshis, feeRate) => {
      setLoading(true);
      try {
        setError(null);
        if (
          !address ||
          !address.payments ||
          !publicKey ||
          !publicKey.payments ||
          !wallet
        ) {
          throw new Error("No wallet is connected");
        }

        const psbtBuilder = new PSBTBuilder({
          address: address.payments,
          feeRate,
          network,
          publicKey: publicKey.payments,
          outputs: [
            {
              address: toAddress,
              value: satoshis,
            },
          ],
        });
        await psbtBuilder.prepare();

        const signedPsbt = await signPsbt({
          address: address.payments,
          wallet,
          network,
          psbt: psbtBuilder.toPSBT(),
        });

        setLoading(false);
        return signedPsbt;
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
        return null;
      }
    },
    [address, network, publicKey, wallet],
  );

  return { send, error, loading };
}
