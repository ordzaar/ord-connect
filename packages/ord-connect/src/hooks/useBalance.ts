import { useCallback, useState } from "react";
import BigNumber from "bignumber.js";
import {
  ADDRESS_FORMAT_TO_TYPE,
  AddressType,
  getAddressesFromPublicKey,
  JsonRpcDatasource,
} from "@ordzaar/ordit-sdk";

import { useOrdConnect } from "../providers/OrdConnectProvider";

export function useBalance() {
  const { network, publicKey, format, chain } = useOrdConnect();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getBalance = useCallback(async (): Promise<number> => {
    setLoading(true);
    try {
      setError(null);
      if (!format || !format.payments || !publicKey || !publicKey.payments) {
        throw new Error("No wallet is connected");
      }

      const { address } = getAddressesFromPublicKey(
        publicKey.payments,
        network,
        ADDRESS_FORMAT_TO_TYPE[format.payments] as Exclude<
          AddressType,
          "p2wsh"
        >,
        chain,
      )[0];

      const datasource = new JsonRpcDatasource({
        chain,
        network,
      });

      const totalBalance = await datasource.getBalance({ address });

      const totalAmountInSats = Number(
        new BigNumber(totalBalance)
          .multipliedBy(100_000_000)
          .toFixed(0, BigNumber.ROUND_HALF_DOWN),
      );

      setLoading(false);
      return totalAmountInSats;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      throw err;
    }
  }, [format, network, publicKey]);

  return { getBalance, error, loading };
}
