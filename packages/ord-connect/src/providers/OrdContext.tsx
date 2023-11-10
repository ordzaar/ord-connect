import { AddressFormats } from "@sadoprotocol/ordit-sdk";
import React, { createContext, useContext, useMemo, useState } from "react";

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
  disconnectWallet: () => {},
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
 * @returns {JSX.Element} Provider component for OrdConnect.
 */
export function OrdConnectProvider({
  children,
  initialNetwork,
}: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<BiAddressString>(
    () => getItemFromLocalStorage(ADDRESS) ?? emptyBiAddressObject,
  );

  const [network, setNetwork] = useState<Network>(
    initialNetwork ?? getItemFromLocalStorage(NETWORK) ?? Network.TESTNET,
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

  function disconnectWallet() {
    setAddress(emptyBiAddressObject);
    setPublicKey(emptyBiAddressObject);
    setFormat(emptyBiAddressObject);
    setWallet(null);
  }

  const context: OrdContextI = useMemo(
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
    [address, publicKey, network, isModalOpen, format],
  );

  return <OrdContext.Provider value={context}>{children}</OrdContext.Provider>;
}

export function useOrdContext() {
  return useContext(OrdContext);
}
