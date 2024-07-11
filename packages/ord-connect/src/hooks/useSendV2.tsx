import { useCallback, useState } from "react";
import { JsonRpcDatasource, PSBTBuilder } from "@ordzaar/ordit-sdk";

import signPsbt from "../lib/signPsbt";
import { useOrdConnect } from "../providers/OrdConnectProvider";

type SendFunction = (sendParams: SendParams) => Promise<SendResponse>;

type SendParams = {
  toAddress: string;
  satoshis: number;
  feeRate: number;
  relay?: boolean;
  rbf?: boolean;
};

type SendResponse = {
  txId?: string;
  signedPsbtHex?: string;
  error?: string;
};

export function useSendV2() {
  const { wallet, network, address, publicKey } = useOrdConnect();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const send: SendFunction = useCallback(
    async ({
      toAddress,
      satoshis,
      feeRate,
      relay = true,
      rbf = false,
    }: SendParams) => {
      setIsLoading(true);

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

        psbtBuilder.setRBF(rbf);

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
          setIsLoading(false);
          return {
            txId,
          };
        }

        setIsLoading(false);

        return {
          signedPsbtHex: signedPsbt.hex,
        };
      } catch (err) {
        setIsLoading(false);
        return {
          error: (err as Error).message,
        };
      }
    },
    [address, network, publicKey, wallet],
  );

  return { send, isLoading };
}
