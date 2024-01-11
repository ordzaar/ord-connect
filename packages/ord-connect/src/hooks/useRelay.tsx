import { useCallback, useState } from "react";
import { JsonRpcDatasource } from "@ordzaar/ordit-sdk";

import { useOrdConnect } from "../providers/OrdConnectProvider";

type RelayFunction = (hex: string) => Promise<string | null>;

export function useRelay() {
  const { network } = useOrdConnect();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const relay: RelayFunction = useCallback(
    async (hex) => {
      setLoading(true);
      try {
        setError(null);

        if (!hex.length || !hex.trim().length) {
          throw new Error("Hex is empty");
        }

        const datasource = new JsonRpcDatasource({ network });
        const txId = await datasource.relay({ hex });

        setLoading(false);
        return txId;
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
        return null;
      }
    },
    [network],
  );

  return { relay, error, loading };
}
