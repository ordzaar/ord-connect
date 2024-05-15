import { useCallback, useState } from "react";
import { JsonRpcDatasource, PSBTBuilder } from "@ordzaar/ordit-sdk";

import signPsbt from "../lib/signPsbt";
import { useOrdConnect } from "../providers/OrdConnectProvider";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate: number,
  relay?: boolean,
) => Promise<string | null>;

export function useSend() {
  const { wallet, network, address, publicKey } = useOrdConnect();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const send: SendFunction = useCallback(
    async (toAddress, satoshis, feeRate, relay = true) => {
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

        if (relay) {
          const datasource = new JsonRpcDatasource({ network });
          const txId = await datasource.relay({ hex: signedPsbt.hex });
          setLoading(false);
          return txId;
        }
        setLoading(false);
        return signedPsbt.hex;
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
