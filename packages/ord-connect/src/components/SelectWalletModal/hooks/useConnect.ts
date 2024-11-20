import { useEffect } from "react";
import {
  BrowserWalletNotInstalledError,
  BrowserWalletRequestCancelledByUserError,
} from "@ordzaar/ordit-sdk";
import { getAddresses as getUnisatAddresses } from "@ordzaar/ordit-sdk/unisat";

import {
  BiAddressFormat,
  BiAddressString,
  Chain,
  Network,
  useOrdConnect,
  Wallet,
} from "../../../providers/OrdConnectProvider";
import { waitForUnisatExtensionReady } from "../../../utils/unisat";

type ConnectedWalletType = {
  address: BiAddressString;
  publicKey: BiAddressString;
  format: BiAddressFormat;
};

const WALLET_CHROME_EXTENSION_URL: Record<Wallet, string> = {
  [Wallet.UNISAT]: "https://unisat.io/download", // their www subdomain doesn't work
};

const connectWallet = async (
  {
    network,
    wallet,
    chain = Chain.BITCOIN,
  }: { network: Network; wallet: string; chain?: Chain },
  { readOnly = false } = {},
): Promise<ConnectedWalletType> => {
  switch (wallet) {
    case Wallet.UNISAT: {
      const unisat = await getUnisatAddresses(network, chain, { readOnly });
      if (!unisat || unisat.length < 1) {
        throw new Error("Unisat via Ordit returned no addresses");
      }

      const unisatWallet = unisat[0];
      return {
        address: {
          ordinals: unisatWallet.address,
          payments: unisatWallet.address,
        },
        publicKey: {
          ordinals: unisatWallet.publicKey,
          payments: unisatWallet.publicKey,
        },
        format: {
          ordinals: unisatWallet.format,
          payments: unisatWallet.format,
        },
      };
    }
    default:
      throw new Error("Invalid wallet");
  }
};

export function useConnect({
  onClose,
  onError: onUserError,
}: {
  onClose: () => void;
  onError: (err: string) => void;
}) {
  const {
    updateAddress,
    network,
    updateWallet,
    updatePublicKey,
    updateFormat,
    disconnectWallet,
    address: connectedAddress,
    publicKey: connectedPublicKey,
    format: connectedFormat,
    wallet: connectedWallet,
    chain,
  } = useOrdConnect();

  const onError = (
    walletProvider: Wallet,
    err:
      | BrowserWalletNotInstalledError
      | BrowserWalletRequestCancelledByUserError
      | Error,
  ) => {
    onUserError(err.message ?? err.toString());
    console.error(`Error while connecting to ${walletProvider} wallet`, err);
    disconnectWallet();

    if (err instanceof BrowserWalletNotInstalledError) {
      window.open(
        WALLET_CHROME_EXTENSION_URL[walletProvider],
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const onConnect = async (wallet: Wallet, { readOnly = false } = {}) => {
    try {
      const { address, publicKey, format } = await connectWallet(
        { network, wallet, chain },
        { readOnly },
      );
      updateAddress({
        ordinals: address.ordinals,
        payments: address.payments,
      });
      updatePublicKey({
        ordinals: publicKey.ordinals,
        payments: publicKey.payments,
      });
      updateWallet(wallet);
      updateFormat({
        ordinals: format.ordinals,
        payments: format.payments,
      });
      onClose();
      return true;
    } catch (err) {
      onError(wallet, err as Error);
      return false;
    }
  };

  // Reconnect address change listener if a connected wallet exists
  useEffect(() => {
    if (connectedWallet !== Wallet.UNISAT) {
      return undefined;
    }

    let isMounted = true;
    let isConnectSuccessful = false;
    const listener = () => onConnect(Wallet.UNISAT);

    if (connectedAddress && connectedPublicKey && connectedFormat) {
      const connectToUnisatWalletOnReady = async () => {
        const isUnisatExtensionReady = await waitForUnisatExtensionReady();
        if (!isMounted) {
          return;
        }
        if (!isUnisatExtensionReady) {
          disconnectWallet();
          return;
        }

        isConnectSuccessful = await onConnect(Wallet.UNISAT, {
          readOnly: true,
        });
        if (!isMounted) {
          return;
        }

        if (isConnectSuccessful) {
          window.unisat.addListener("accountsChanged", listener);
        }
      };
      connectToUnisatWalletOnReady();
    }
    return () => {
      isMounted = false;
      if (isConnectSuccessful) {
        window.unisat.removeListener("accountsChanged", listener);
      }
    };
  }, [connectedWallet]);

  return { connectWallet: onConnect };
}
