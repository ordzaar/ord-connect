import { useCallback, useState } from "react";
import { JsonRpcDatasource, PSBTBuilder } from "@ordzaar/ordit-sdk";

import signPsbt from "../lib/signPsbt";
import { useOrdConnect } from "../providers/OrdConnectProvider";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate: number,
  relay?: boolean,
) => Promise<SendResponse>;

type SendResponse = {
  txId?: string;
  signedPsbtHex?: string;
  error?: string;
};

export function useSendV2() {
  const { wallet, network, address, publicKey } = useOrdConnect();
  const [loading, setLoading] = useState<boolean>(false);

  const send: SendFunction = useCallback(
    async (toAddress, satoshis, feeRate, relay = true) => {
      setLoading(true);

      try {
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

          return {
            txId,
          };
        }

        setLoading(false);

        return {
          signedPsbtHex: signedPsbt.hex,
        };
      } catch (err) {
        setLoading(false);
        return {
          error: (err as Error).message,
        };
      }
    },
    [address, network, publicKey, wallet],
  );

  return { send, loading };
}
