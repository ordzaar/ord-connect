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

interface OrdContextI {
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

const OrdContext = createContext<OrdContextI>({
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

const KEY_PREFIX = "ord-connect";
const ADDRESS = "address";
const WALLET = "wallet";
const PUBLIC_KEY = "publicKey";
const FORMAT = "format";
const SAFE_MODE = "safeMode";
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
function setItemToLocalStorage(
  _key: string,
  value: string | null | BiAddress<any>,
) {
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
 * @param {React.PropsWithChildren<any>} props - Props object.
 * @param {string} [props.initialNetwork] - Initialize the internal context network state on mount.
 *  * @param {string} [props.initialSafeMode] - Initialize the internal context safeMode state on mount.
 * @returns {JSX.Element} Provider component for OrdConnect.
 */
export function OrdConnectProvider({
  children,
  initialNetwork,
  initialSafeMode,
}: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<BiAddressString>(
    () => getItemFromLocalStorage(ADDRESS) ?? emptyBiAddressObject,
  );

  const [network, setNetwork] = useState<Network>(
    initialNetwork ?? getItemFromLocalStorage(NETWORK) ?? Network.TESTNET,
  );

  const [safeMode, setSafeMode] = useState<boolean>(
    initialSafeMode ?? Boolean(getItemFromLocalStorage(SAFE_MODE)) ?? true,
  );

  const [wallet, setWallet] = useState<Wallet | null>(() =>
    getItemFromLocalStorage(WALLET),
  );
  const [publicKey, setPublicKey] = useState<BiAddressString>(
    () => getItemFromLocalStorage(PUBLIC_KEY) ?? emptyBiAddressObject,
  );

  const [format, setFormat] = useState<BiAddressFormat>(
    () => getItemFromLocalStorage(FORMAT) ?? emptyBiAddressObject,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => setItemToLocalStorage(ADDRESS, address), [address]);
  useEffect(() => setItemToLocalStorage(WALLET, wallet), [wallet]);
  useEffect(() => setItemToLocalStorage(PUBLIC_KEY, publicKey), [publicKey]);
  useEffect(() => setItemToLocalStorage(FORMAT, format), [format]);
  useEffect(() => setItemToLocalStorage(NETWORK, network), [network]);
  useEffect(
    () => setItemToLocalStorage(SAFE_MODE, safeMode.toString()),
    [safeMode],
  );

  function disconnectWallet() {
    setAddress(emptyBiAddressObject);
    setPublicKey(emptyBiAddressObject);
    setFormat(emptyBiAddressObject);
    setWallet(null);
  }

  const context: OrdContextI = useMemo(
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

  return <OrdContext.Provider value={context}>{children}</OrdContext.Provider>;
}

export function useOrdContext() {
  return useContext(OrdContext);
}
