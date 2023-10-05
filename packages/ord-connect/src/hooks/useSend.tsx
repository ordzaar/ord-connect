import { useState } from "react";
import { JsonRpcDatasource, PSBTBuilder } from "@sadoprotocol/ordit-sdk";
import { sendBtcTransaction } from "sats-connect";

import { useOrdContext, Wallet } from "../providers/OrdContext.tsx";
import { capitalizeFirstLetter } from "../utils/text-helper";
import signPsbt from "../lib/signPsbt";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate?: number,
) => Promise<string | null>;

export function useSend(): [SendFunction, string | null, boolean] {
  const { wallet, network, address, publicKey, safeMode } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const datasource = new JsonRpcDatasource({ network });

  const safeSend: SendFunction = async (toAddress, satoshis, feeRate) => {
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

  const unsafeSend: SendFunction = async (toAddress, satoshis, feeRate) => {
    setLoading(true);
    try {
      setError(null);
      if (!address || !publicKey) {
        throw new Error("No wallet is connected");
      }

      let txId;
      if (wallet === Wallet.UNISAT) {
        txId = await window.unisat.sendBitcoin(toAddress, satoshis, {
          feeRate,
        });
      } else if (wallet === Wallet.XVERSE) {
        const payload = {
          network: {
            type: capitalizeFirstLetter(network) as "Mainnet" | "Testnet",
          },
          recipients: [{ address: toAddress, amountSats: satoshis as any }],
          senderAddress: address.payments,
        };

        const xverseOptions = {
          payload,
          onCancel: () => {
            throw Error("User rejected the request.");
          },
          // eslint-disable-next-line no-return-assign
          onFinish: (xverseTxId) => (txId = xverseTxId),
        };

        await sendBtcTransaction(xverseOptions);
      } else {
        throw new Error("No wallet selected");
      }

      setLoading(false);
      return txId;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return [safeMode ? safeSend : unsafeSend, error, loading];
}
