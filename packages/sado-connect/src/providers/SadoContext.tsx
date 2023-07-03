import { createContext, useContext, useState } from "react";

type Network = "mainnet" | "testnet";

interface SadoContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
}

const SadoContext = createContext<SadoContextI>(undefined as any);

/**
 * (Optionally) global context provider for SadoConnectKit and its consumer(s).
 *
 * @component
 * @example
 * // Usage:
 * // Wrap your application with the SadoConnectProvider to access the SadoContext.
 * // The provider manages the state and provides it to the child components.
 *
 * import { SadoConnectProvider } from "./SadoConnectProvider";
 *
 * function App() {
 *   return (
 *     <SadoConnectProvider>
 *       <YourAppContent />
 *     </SadoConnectProvider>
 *   );
 * }
 *
 * @param {React.PropsWithChildren<any>} props - Props object.
 * @returns {JSX.Element} Provider component for SadoConnect.
 */
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
