import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";
import { addressNameToType, ordit } from "@sadoprotocol/ordit-sdk";
import { unresponsiveExtensionHandler } from "../utils/promise-with-timeout";

export function useBalance(): [() => Promise<number>, string | null, boolean] {
  const { network, publicKey, format, safeMode } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getSafeBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) throw new Error("No wallet is connected");
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

  const getNativeBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) throw new Error("No wallet is connected");

      const unisatBalance = await unresponsiveExtensionHandler(
        window.unisat.getBalance(),
        Wallet.UNISAT
      );

      return unisatBalance.confirmed;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return 0; // Returning 0 as default value in case of an error
    }
  };

  return [safeMode ? getSafeBalance : getNativeBalance, error, loading];
}
