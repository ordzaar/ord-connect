import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AddressFormat } from "@ordzaar/ordit-sdk";

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

const KEY_PREFIX = "ord-connect";
const ADDRESS = "address";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";
const FORMAT = "format";
const NETWORK = "network";

// Helper function to get item from localStorage
function getItemFromLocalStorage<T>(_key: string): T | null {
  const key = `${KEY_PREFIX}_${_key}`;
  try {
    return JSON.parse(localStorage.getItem(key)) as T | null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage`, error);
    return null;
  }
}

// Helper function to set item to localStorage
function setItemToLocalStorage<T>(_key: string, value: T) {
  const key = `${KEY_PREFIX}_${_key}`;
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

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
 * @param props.initialNetwork - Initial network state.
 * @returns Provider component for OrdConnect.
 */
export function OrdConnectProvider({
  children,
  initialNetwork,
}: PropsWithChildren<OrdConnectProviderProps>) {
  const [address, setAddress] = useState<BiAddressString>(
    () => getItemFromLocalStorage(ADDRESS) ?? EMPTY_BIADDRESS_OBJECT,
  );

  const [network, setNetwork] = useState<Network>(
    initialNetwork ?? getItemFromLocalStorage(NETWORK) ?? Network.TESTNET,
  );

  const [wallet, setWallet] = useState<Wallet | null>(() =>
    getItemFromLocalStorage(WALLET),
  );
  const [publicKey, setPublicKey] = useState<BiAddressString>(
    () => getItemFromLocalStorage(PUBLIC_KEY) ?? EMPTY_BIADDRESS_OBJECT,
  );

  const [format, setFormat] = useState<BiAddressFormat>(
    () => getItemFromLocalStorage(FORMAT) ?? EMPTY_BIADDRESS_OBJECT,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const disconnectWallet = useCallback(() => {
    setAddress(EMPTY_BIADDRESS_OBJECT);
    setPublicKey(EMPTY_BIADDRESS_OBJECT);
    setFormat(EMPTY_BIADDRESS_OBJECT);
    setWallet(null);
  }, []);

  const context: OrdContextType = useMemo(
    () => ({
      address,
      updateAddress: (newAddress) => {
        setItemToLocalStorage(ADDRESS, newAddress);
        setAddress(newAddress);
      },
      publicKey,
      updatePublicKey: (newPublicKey) => {
        setItemToLocalStorage(PUBLIC_KEY, newPublicKey);
        setPublicKey(newPublicKey);
      },
      network,
      updateNetwork: (newNetwork) => {
        setItemToLocalStorage(NETWORK, newNetwork);
        setNetwork(newNetwork);
      },
      wallet,
      updateWallet: (newWallet) => {
        setItemToLocalStorage(WALLET, newWallet);
        setWallet(newWallet);
      },
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      format,
      updateFormat: (newFormat) => {
        setItemToLocalStorage(FORMAT, newFormat);
        setFormat(newFormat);
      },
      disconnectWallet,
    }),
    [
      address,
      publicKey,
      network,
      wallet,
      isModalOpen,
      format,
      disconnectWallet,
    ],
  );

  return <OrdContext.Provider value={context}>{children}</OrdContext.Provider>;
}

export function useOrdContext() {
  return useContext(OrdContext);
}
