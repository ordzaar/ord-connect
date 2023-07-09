import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";

type SendFunction = (
  address: string,
  satoshis: number,
  feeRate: number
) => Promise<string | null>;

function useSend(): [SendFunction, string | null] {
  const { wallet } = useSadoContext();
  const [error, setError] = useState<string | null>(null);

  const send: SendFunction = async (toAddress, satoshis, feeRate) => {
    if (wallet === Wallet.UNISAT) {
      try {
        const txId = await window.unisat.sendBitcoin(toAddress, satoshis, {
          feeRate,
        });
        return txId;
      } catch (err: any) {
        setError(err.message);
      }
    } else if (wallet === Wallet.XVERSE) {
      setError("XVERSE wallet not supported yet");
    } else {
      setError("No wallet selected");
    }
    return null;
  };

  return [send, error];
}

export default useSend;
