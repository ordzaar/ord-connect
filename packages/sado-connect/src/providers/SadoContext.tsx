/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState, useEffect } from "react";

type Network = "mainnet" | "testnet";

interface SadoContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
}

const SadoContext = createContext<SadoContextI>({
  address: null,
  updateAddress: () => {},
  network: "testnet",
  updateNetwork: () => {},
});

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

  // Load address from session storage on component mount
  useEffect(() => {
    const storedAddress = sessionStorage.getItem("address");
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  // Sync address to session storage whenever it changes
  useEffect(() => {
    if (address) {
      sessionStorage.setItem("address", address);
    } else {
      sessionStorage.removeItem("address");
    }
  }, [address]);

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
