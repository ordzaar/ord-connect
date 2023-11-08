import { JsonRpcDatasource, PSBTBuilder } from "@sadoprotocol/ordit-sdk";
import { useState } from "react";

import signPsbt from "../lib/signPsbt";
import { useOrdContext } from "../providers/OrdContext.tsx";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate?: number,
) => Promise<string | null>;

export function useSend(): [SendFunction, string | null, boolean] {
  const { wallet, network, address, publicKey } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const datasource = new JsonRpcDatasource({ network });

  const send: SendFunction = async (toAddress, satoshis, feeRate) => {
    setLoading(true);
    try {
      setError(null);
      if (!address || !publicKey) {
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

      const txId = await datasource.relay({ hex: signedPsbt.hex });

      setLoading(false);
      return txId;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return [send, error, loading];
}
