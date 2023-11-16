import {
  ADDRESS_FORMAT_TO_TYPE,
  getAddressesFromPublicKey,
  JsonRpcDatasource,
} from "@ordzaar/ordit-sdk";
import { useState } from "react";

import { useOrdContext } from "../providers/OrdContext";

export function useBalance(): [() => Promise<number>, string | null, boolean] {
  const { network, publicKey, format } = useOrdContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const datasource = new JsonRpcDatasource({ network });

  const getBalance = async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !publicKey) {
        throw new Error("No wallet is connected");
      }
      const { address } = getAddressesFromPublicKey(
        publicKey.payments,
        network,
        ADDRESS_FORMAT_TO_TYPE[format.payments],
      )[0];

      const { spendableUTXOs } = await datasource.getUnspents({
        address,
        type: "spendable",
      });

      const totalCardinalsAvailable = spendableUTXOs.reduce(
        (total: number, spendable: { safeToSpend: boolean; sats: number }) =>
          spendable.safeToSpend ? total + spendable.sats : total,
        0,
      );

      setLoading(false);
      return totalCardinalsAvailable;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return 0; // Returning 0 as default value in case of an error
    }
  };

  return [getBalance, error, loading];
}
