import { useState } from "react";
import {
  addressNameToType,
  OrditApi,
  getAddressesFromPublicKey,
} from "@sadoprotocol/ordit-sdk";
import { useOrdContext, Wallet } from "../providers/OrdContext.tsx";

export function useBalance(): [() => Promise<number>, string | null, boolean] {
  const { network, publicKey, format, safeMode, wallet } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getSafeBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }
      const { address } = getAddressesFromPublicKey(
        publicKey.payments,
        network,
        addressNameToType[format.payments],
      )[0];
      const { spendableUTXOs } = await OrditApi.fetchUnspentUTXOs({
        address,
        network,
        sort: "desc",
        type: "spendable",
      });

      const totalCardinalsAvailable = spendableUTXOs.reduce(
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
