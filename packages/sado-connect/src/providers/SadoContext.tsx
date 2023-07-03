import { createContext, useContext, useState } from "react";

type Network = "mainnet" | "testnet";

interface SadoContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
}

const SadoContext = createContext<SadoContextI>(undefined as any);

export function SadoConnectProvider({
  children,
}: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>("testnet");

  const context: SadoContextI = {
    address,
    updateAddress: (address) => setAddress(address),
    network,
    updateNetwork: (network) => setNetwork(network),
  };

  return (
    <SadoContext.Provider value={context}>{children}</SadoContext.Provider>
  );
}
export function useSadoContext() {
  return useContext(SadoContext);
}
