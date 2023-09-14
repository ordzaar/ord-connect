import { useState } from "react";
import { CreatePsbtOptions, ordit } from "@sadoprotocol/ordit-sdk";
import { sendBtcTransaction } from "sats-connect";
import { Psbt } from "bitcoinjs-lib";
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

  const safeSend: SendFunction = async (toAddress, satoshis, feeRate) => {
    setLoading(true);
    try {
      setError(null);
      if (!address || !publicKey) {
        throw new Error("No wallet is connected");
      }

      const psbtTemplate: CreatePsbtOptions = {
        satsPerByte: feeRate,
        network,
        pubKey: publicKey.payments,
        address: address.payments,
        outputs: [
          {
            address: toAddress,
            cardinals: satoshis,
          },
        ],
        enableRBF: true,
      };

      const createPsbtRes = await ordit.transactions.createPsbt(psbtTemplate);
      const unsignedPsbt = Psbt.fromBase64(createPsbtRes.base64);
      const signedPsbt = await signPsbt({
        address: address.payments,
        wallet,
        network,
        psbt: unsignedPsbt,
      });

      const txId = await ordit.transactions.relayTransaction(
        signedPsbt.hex,
        network,
      );
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
