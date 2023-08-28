import { useState } from "react";
import { addressNameToType, ordit } from "@sadoprotocol/ordit-sdk";
import { useSadoContext, Wallet } from "../providers/SadoContext";

export function useBalance(): [() => Promise<number>, string | null, boolean] {
  const { network, publicKey, format, safeMode, wallet } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getSafeBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }
      const walletWithBalances = await ordit.wallet.getWalletWithBalances({
        pubKey: publicKey,
        network,
        format: addressNameToType[format],
      });

      const currentWallet = walletWithBalances.addresses.find(
        (w) => w.format === format,
      );

      const totalCardinalsAvailable = (currentWallet as any).unspents.reduce(
        (total: number, spendable: { safeToSpend: boolean; sats: number }) =>
          spendable.safeToSpend ? total + spendable.sats : total,
        0,
      );

      setLoading(false);
      return totalCardinalsAvailable as number;
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
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }

      if (wallet === Wallet.UNISAT) {
        const unisatBalance = await window.unisat.getBalance();
        setLoading(false);
        return unisatBalance.confirmed;
      }
      if (wallet === Wallet.XVERSE) {
        throw Error(
          "Xverse does not support returning a balance. Turn on safeMode.",
        );
      }
      return 0;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return 0; // Returning 0 as default value in case of an error
    }
  };

  return [safeMode ? getSafeBalance : getNativeBalance, error, loading];
}
