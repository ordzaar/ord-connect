import { AddressFormats } from "@sadoprotocol/ordit-sdk";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
}

export enum Wallet {
  UNISAT = "unisat",
  XVERSE = "xverse",
}

// TO-DO: Support unsafe psbt
export enum SafeMode {
  InscriptionAwareOnly,
  InscriptionAndOrdinalAware,
  NoSafety,
}

interface SadoContextI {
  address: string | null;
  addressAlt: string | null;
  updateAddress: (address: string | null) => void;
  updateAddressAlt: (addressAlt: string | null) => void;
  publicKey: string | null;
  updatePublicKey: (publicKey: string | null) => void;
  publicKeyAlt: string | null;
  updatePublicKeyAlt: (publicKeyAlt: string | null) => void;
  network: Network;
  updateNetwork: (network: Network) => void;
  wallet: Wallet | null;
  updateWallet: (wallet: Wallet | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  format: AddressFormats;
  updateFormat: (format: AddressFormats | null) => void;
  safeMode: boolean;
  updateSafeMode: (safeMode: boolean) => void;
}

const SadoContext = createContext<SadoContextI>({
  address: null,
  updateAddress: () => {},
  addressAlt: null,
  updateAddressAlt: () => {},
  publicKey: null,
  updatePublicKey: () => {},
  publicKeyAlt: null,
  updatePublicKeyAlt: () => {},
  network: Network.TESTNET,
  updateNetwork: () => {},
  wallet: null,
  updateWallet: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  format: null,
  updateFormat: () => {},
  safeMode: null,
  updateSafeMode: () => {},
});

const ADDRESS = "address";
const ADDRESS_ALT = "addressAlt";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";
const PUBLIC_KEY_ALT = "publicKeyAlt";
const FORMAT = "format";
const SAFE_MODE = "safeMode";
const NETWORK = "network";

// Helper function to get item from sessionStorage
function getItemFromSessionStorage<T>(key: string): T | null {
  try {
    return sessionStorage.getItem(key) as T | null;
  } catch (error) {
    console.error(`Error retrieving ${key} from sessionStorage`, error);
    return null;
  }
}

// Helper function to set item to sessionStorage
function setItemToSessionStorage(key: string, value: string | null) {
  try {
    if (value) {
      sessionStorage.setItem(key, value);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error saving ${key} to sessionStorage`, error);
  }
}

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
 * @param {string} [props.initialNetwork] - Initialize the internal context network state on mount.
 *  * @param {string} [props.initialSafeMode] - Initialize the internal context safeMode state on mount.
 * @returns {JSX.Element} Provider component for SadoConnect.
 */
export function SadoConnectProvider({
  children,
  initialNetwork,
  initialSafeMode,
}: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<string | null>(() =>
    getItemFromSessionStorage(ADDRESS),
  );

  const [addressAlt, setAddressAlt] = useState<string | null>(() =>
    getItemFromSessionStorage(ADDRESS_ALT),
  );

  const [network, setNetwork] = useState<Network>(
    initialNetwork ?? getItemFromSessionStorage(NETWORK) ?? Network.TESTNET,
  );

  const [safeMode, setSafeMode] = useState<boolean>(
    initialSafeMode ?? Boolean(getItemFromSessionStorage(SAFE_MODE)) ?? true,
  );

  const [wallet, setWallet] = useState<Wallet | null>(() =>
    getItemFromSessionStorage(WALLET),
  );
  const [publicKey, setPublicKey] = useState<string | null>(() =>
    getItemFromSessionStorage(PUBLIC_KEY),
  );

  const [publicKeyAlt, setPublicKeyAlt] = useState<string | null>(() =>
    getItemFromSessionStorage(PUBLIC_KEY_ALT),
  );

  const [format, setFormat] = useState<AddressFormats | null>(() =>
    getItemFromSessionStorage(FORMAT),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => setItemToSessionStorage(ADDRESS, address), [address]);
  useEffect(
    () => setItemToSessionStorage(ADDRESS_ALT, addressAlt),
    [addressAlt],
  );
  useEffect(() => setItemToSessionStorage(WALLET, wallet), [wallet]);
  useEffect(() => setItemToSessionStorage(PUBLIC_KEY, publicKey), [publicKey]);
  useEffect(
    () => setItemToSessionStorage(PUBLIC_KEY_ALT, publicKeyAlt),
    [publicKeyAlt],
  );
  useEffect(() => setItemToSessionStorage(FORMAT, format), [format]);
  useEffect(() => setItemToSessionStorage(NETWORK, network), [network]);
  useEffect(
    () => setItemToSessionStorage(SAFE_MODE, safeMode.toString()),
    [safeMode],
  );

  const context: SadoContextI = useMemo(
    () => ({
      address,
      updateAddress: setAddress,
      addressAlt,
      updateAddressAlt: setAddressAlt,
      publicKey,
      updatePublicKey: setPublicKey,
      publicKeyAlt,
      updatePublicKeyAlt: setPublicKeyAlt,
      network,
      updateNetwork: setNetwork,
      wallet,
      updateWallet: setWallet,
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      format,
      updateFormat: setFormat,
      safeMode,
      updateSafeMode: setSafeMode,
    }),
    [
      address,
      addressAlt,
      publicKey,
      publicKeyAlt,
      network,
      isModalOpen,
      format,
      safeMode,
    ],
  );

  return (
    <SadoContext.Provider value={context}>{children}</SadoContext.Provider>
  );
}

export function useSadoContext() {
  return useContext(SadoContext);
}
