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

export interface BiAddress<T> {
  payments: T | null;
  ordinals: T | null;
}

type BiAddressString = BiAddress<string>;
type BiAddressFormat = BiAddress<AddressFormats>;

export const emptyBiAddressObject: BiAddress<null> = {
  payments: null,
  ordinals: null,
};

interface SadoContextI {
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
  safeMode: boolean;
  updateSafeMode: (safeMode: boolean) => void;
  disconnectWallet: () => void;
}

const SadoContext = createContext<SadoContextI>({
  address: emptyBiAddressObject,
  updateAddress: () => {},
  publicKey: emptyBiAddressObject,
  updatePublicKey: () => {},
  network: Network.TESTNET,
  updateNetwork: () => {},
  wallet: null,
  updateWallet: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  format: emptyBiAddressObject,
  updateFormat: () => {},
  safeMode: null,
  updateSafeMode: () => {},
  disconnectWallet: () => {},
});

const ADDRESS = "address";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";
const FORMAT = "format";
const SAFE_MODE = "safeMode";
const NETWORK = "network";

// Helper function to get item from sessionStorage
function getItemFromSessionStorage<T>(key: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(key)) as T | null;
  } catch (error) {
    console.error(`Error retrieving ${key} from sessionStorage`, error);
    return null;
  }
}

// Helper function to set item to sessionStorage
function setItemToSessionStorage(
  key: string,
  value: string | null | BiAddress<any>,
) {
  try {
    if (value) {
      sessionStorage.setItem(key, JSON.stringify(value));
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
  const [address, setAddress] = useState<BiAddressString>(
    () => getItemFromSessionStorage(ADDRESS) ?? emptyBiAddressObject,
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
  const [publicKey, setPublicKey] = useState<BiAddressString>(
    () => getItemFromSessionStorage(PUBLIC_KEY) ?? emptyBiAddressObject,
  );

  const [format, setFormat] = useState<BiAddressFormat>(
    () => getItemFromSessionStorage(FORMAT) ?? emptyBiAddressObject,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => setItemToSessionStorage(ADDRESS, address), [address]);
  useEffect(() => setItemToSessionStorage(WALLET, wallet), [wallet]);
  useEffect(() => setItemToSessionStorage(PUBLIC_KEY, publicKey), [publicKey]);
  useEffect(() => setItemToSessionStorage(FORMAT, format), [format]);
  useEffect(() => setItemToSessionStorage(NETWORK, network), [network]);
  useEffect(
    () => setItemToSessionStorage(SAFE_MODE, safeMode.toString()),
    [safeMode],
  );

  function disconnectWallet() {
    setAddress(emptyBiAddressObject);
    setPublicKey(emptyBiAddressObject);
    setFormat(emptyBiAddressObject);
    setWallet(null);
  }

  const context: SadoContextI = useMemo(
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
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      format,
      updateFormat: setFormat,
      safeMode,
      updateSafeMode: setSafeMode,
      disconnectWallet,
    }),
    [address, publicKey, network, isModalOpen, format, safeMode],
  );

  return (
    <SadoContext.Provider value={context}>{children}</SadoContext.Provider>
  );
}

export function useSadoContext() {
  return useContext(SadoContext);
}
