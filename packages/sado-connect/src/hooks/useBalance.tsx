import { useState } from "react";
import { useSadoContext } from "../providers/SadoContext";
import { addressNameToType, ordit } from "@sadoprotocol/ordit-sdk";

export function useBalance(): [() => Promise<number>, string | null, boolean] {
  const { network, publicKey, format } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      const walletWithBalances = await ordit.wallet.getWalletWithBalances({
        pubKey: publicKey,
        network,
        format: addressNameToType[format],
      });

      const currentWallet = walletWithBalances.addresses.find(
        (w) => w.format === format
      );

      const total_cardinals_available = (currentWallet as any).unspents.reduce(
        (total: number, spendable: { safeToSpend: boolean; sats: number }) => {
          return spendable.safeToSpend ? total + spendable.sats : total;
        },
        0
      );

      setLoading(false);
      return total_cardinals_available as number;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return 0; // Returning 0 as default value in case of an error
    }
  };

  return [getBalance, error, loading];
}
