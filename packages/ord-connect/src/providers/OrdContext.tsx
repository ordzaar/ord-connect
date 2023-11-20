import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AddressFormat } from "@ordzaar/ordit-sdk";

import { useLocalStorage } from "../hooks/useLocalStorage";

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

export enum Wallet {
  UNISAT = "unisat",
  XVERSE = "xverse",
}

export interface BiAddress<T> {
  payments: T | null;
  ordinals: T | null;
}

type BiAddressString = BiAddress<string>;
type BiAddressFormat = BiAddress<AddressFormat>;

const EMPTY_BIADDRESS_OBJECT: BiAddress<null> = {
  payments: null,
  ordinals: null,
};

const NOOP = () => {};

interface OrdContextType {
  address: BiAddressString;
  updateAddress: (address: BiAddressString) => void;
  publicKey: BiAddressString;
  updatePublicKey: (publicKey: BiAddressString) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
  wallet: Wallet | null;
  updateWallet: (wallet: Wallet | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  format: BiAddressFormat;
  updateFormat: (format: BiAddressFormat) => void;
  disconnectWallet: () => void;
}

const OrdContext = createContext<OrdContextType>({
  address: EMPTY_BIADDRESS_OBJECT,
  updateAddress: NOOP,
  publicKey: EMPTY_BIADDRESS_OBJECT,
  updatePublicKey: NOOP,
  network: Network.TESTNET,
  updateNetwork: NOOP,
  wallet: null,
  updateWallet: NOOP,
  isModalOpen: false,
  openModal: NOOP,
  closeModal: NOOP,
  format: EMPTY_BIADDRESS_OBJECT,
  updateFormat: NOOP,
  disconnectWallet: NOOP,
});

const ADDRESS = "address";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";
const FORMAT = "format";
const NETWORK = "network";

export type OrdConnectProviderProps = {
  initialNetwork: Network;
};

/**
 * (Optionally) global context provider for OrdConnectKit and its consumer(s).
 *
 * @component
 * @example
 * // Usage:
 * // Wrap your application with the OrdConnectProvider to access the OrdContext.
 * // The provider manages the state and provides it to the child components.
 *
 * import { OrdConnectProvider } from "./OrdConnectProvider";
 *
 * function App() {
 *   return (
 *     <OrdConnectProvider>
 *       <YourAppContent />
 *     </OrdConnectProvider>
 *   );
 * }
 *
 * @param props - Props object.
 * @param props.initialNetwork - Initial network state if network is not set.
 * @returns Provider component for OrdConnect.
 */
export function OrdConnectProvider({
  children,
  initialNetwork,
}: PropsWithChildren<OrdConnectProviderProps>) {
  if (!initialNetwork) {
    throw new Error("Initial network cannot be empty");
  }

  const [address, setAddress] = useLocalStorage<BiAddressString>(
    ADDRESS,
    EMPTY_BIADDRESS_OBJECT,
  );

  const [network, setNetwork] = useLocalStorage<Network>(
    NETWORK,
    initialNetwork,
  );

  const [wallet, setWallet] = useLocalStorage<Wallet | null>(WALLET, null);
  const [publicKey, setPublicKey] = useLocalStorage<BiAddressString>(
    PUBLIC_KEY,
    EMPTY_BIADDRESS_OBJECT,
  );

  const [format, setFormat] = useLocalStorage<BiAddressFormat>(
    FORMAT,
    EMPTY_BIADDRESS_OBJECT,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const disconnectWallet = useCallback(() => {
    setAddress(EMPTY_BIADDRESS_OBJECT);
    setPublicKey(EMPTY_BIADDRESS_OBJECT);
    setFormat(EMPTY_BIADDRESS_OBJECT);
    setWallet(null);
  }, [setAddress, setFormat, setPublicKey, setWallet]);

  const context: OrdContextType = useMemo(
    () => ({
      address,
      updateAddress: setAddress,
      publicKey,
      updatePublicKey: setPublicKey,
      network,
      updateNetwork: setNetwork,
      wallet,
      updateWallet: setWallet,
      isModalOpen,
      openModal,
      closeModal,
      format,
      updateFormat: setFormat,
      disconnectWallet,
    }),
    [
      address,
      setAddress,
      publicKey,
      setPublicKey,
      network,
      setNetwork,
      wallet,
      setWallet,
      isModalOpen,
      openModal,
      closeModal,
      format,
      setFormat,
      disconnectWallet,
    ],
  );

  return <OrdContext.Provider value={context}>{children}</OrdContext.Provider>;
}

export function useOrdContext() {
  return useContext(OrdContext);
}
