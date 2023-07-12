/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState, useEffect } from "react";

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

export enum Wallet {
  UNISAT = "unisat",
  XVERSE = "xverse",
}

interface SadoContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
  publicKey: string | null;
  updatePublicKey: (publicKey: string | null) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
  wallet: Wallet | null;
  updateWallet: (wallet: Wallet | null) => void;
}

const SadoContext = createContext<SadoContextI>({
  address: null,
  updateAddress: () => {},
  publicKey: null,
  updatePublicKey: () => {},
  network: Network.TESTNET,
  updateNetwork: () => {},
  wallet: null,
  updateWallet: () => {},
});

const ADDRESS = "address";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";

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
  const [network, setNetwork] = useState<Network>(Network.TESTNET);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedAddress = sessionStorage.getItem(ADDRESS);
      if (storedAddress) {
        setAddress(storedAddress);
      }

      const storedPublicKey = sessionStorage.getItem(PUBLIC_KEY);
      if (storedPublicKey) {
        setPublicKey(storedPublicKey);
      }

      const storedWallet = sessionStorage.getItem(WALLET);
      if (storedWallet === Wallet.UNISAT || storedWallet === Wallet.XVERSE) {
        setWallet(storedWallet);
      }
    } catch (error) {
      console.error("Error retrieving data from sessionStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (address) {
        sessionStorage.setItem(ADDRESS, address);
      } else {
        sessionStorage.removeItem(ADDRESS);
      }
    } catch (error) {
      console.error("Error saving address to sessionStorage", error);
    }
  }, [address]);

  useEffect(() => {
    try {
      if (wallet) {
        sessionStorage.setItem(WALLET, wallet);
      } else {
        sessionStorage.removeItem(WALLET);
      }
    } catch (error) {
      console.error("Error saving wallet to sessionStorage", error);
    }
  }, [wallet]);

  useEffect(() => {
    try {
      if (publicKey) {
        sessionStorage.setItem(PUBLIC_KEY, publicKey);
      } else {
        sessionStorage.removeItem(PUBLIC_KEY);
      }
    } catch (error) {
      console.error("Error saving publicKey to sessionStorage", error);
    }
  }, [publicKey]);

  const context: SadoContextI = {
    address,
    updateAddress: setAddress,
    publicKey,
    updatePublicKey: setPublicKey,
    network,
    updateNetwork: setNetwork,
    wallet,
    updateWallet: setWallet,
  };

  return (
    <SadoContext.Provider value={context}>{children}</SadoContext.Provider>
  );
}
export function useSadoContext() {
  return useContext(SadoContext);
}
