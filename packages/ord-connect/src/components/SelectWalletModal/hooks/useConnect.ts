import {
  BrowserWalletNotInstalledError,
  BrowserWalletRequestCancelledByUserError,
} from "@ordzaar/ordit-sdk";
import { getAddresses as getLeatherAddresses } from "@ordzaar/ordit-sdk/leather";
import { getAddresses as getMagicEdenAddress } from "@ordzaar/ordit-sdk/magiceden";
import { getAddresses as getOKXAddresses } from "@ordzaar/ordit-sdk/okx";
import { getAddresses as getUnisatAddresses } from "@ordzaar/ordit-sdk/unisat";
import { getAddresses as getXverseAddresses } from "@ordzaar/ordit-sdk/xverse";

import {
  BiAddressFormat,
  BiAddressString,
  Network,
  useOrdConnect,
  Wallet,
} from "../../../providers/OrdConnectProvider";

type ConnectedWalletType = {
  address: BiAddressString;
  publicKey: BiAddressString;
  format: BiAddressFormat;
};

const WALLET_CHROME_EXTENSION_URL: Record<Wallet, string> = {
  [Wallet.OKX]: "https://www.okx.com/web3",
  [Wallet.MAGICEDEN]: "https://wallet.magiceden.io/",
  [Wallet.UNISAT]: "https://unisat.io/download", // their www subdomain doesn't work
  [Wallet.XVERSE]: "https://www.xverse.app/download",
  [Wallet.LEATHER]: "https://leather.io/install-extension",
};

const connectWallet = async (
  { network, wallet }: { network: Network; wallet: string },
  { readOnly = false } = {},
): Promise<ConnectedWalletType> => {
  switch (wallet) {
    case Wallet.UNISAT: {
      const unisat = await getUnisatAddresses(network, readOnly);
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
    case Wallet.XVERSE: {
      const xverse = await getXverseAddresses(network);
      if (!xverse || xverse.length < 1) {
        throw new Error("Xverse via Ordit returned no addresses");
      }

      // Xverse provides a nested segwit address by default for sending and receiving payments
      // Ledger wallets on Xverse will return a native segwit address for payments instead
      const paymentsAddress = xverse.find(
        (walletAddress) =>
          walletAddress.format === "p2sh-p2wpkh" ||
          walletAddress.format === "segwit",
      );

      if (!paymentsAddress) {
        throw new Error(
          "Xverse via Ordit did not return a P2SH or Segwit address",
        );
      }

      const ordinalsAddress = xverse.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

      if (!ordinalsAddress) {
        throw new Error("Xverse via Ordit did not return a Taproot address");
      }

      return {
        address: {
          ordinals: ordinalsAddress.address,
          payments: paymentsAddress.address,
        },
        publicKey: {
          ordinals: ordinalsAddress.publicKey,
          payments: paymentsAddress.publicKey,
        },
        format: {
          ordinals: ordinalsAddress.format,
          payments: paymentsAddress.format,
        },
      };
    }
    case Wallet.MAGICEDEN: {
      const magicEdenAddresses = await getMagicEdenAddress(network);
      if (!magicEdenAddresses || magicEdenAddresses.length < 1) {
        throw new Error("Magic Eden via Ordit returned no addresses");
      }

      // Magic Eden provides a segwit address by default for sending and receiving payments
      // Imported xverse wallets will return a p2sh address for payments by default instead
      const paymentsAddress = magicEdenAddresses.find(
        (walletAddress) =>
          walletAddress.format === "segwit" ||
          walletAddress.format === "p2sh-p2wpkh",
      );

      if (!paymentsAddress) {
        throw new Error(
          "Magic Eden via Ordit did not return a P2SH or Segwit address",
        );
      }

      const ordinalsAddress = magicEdenAddresses.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

      if (!ordinalsAddress) {
        throw new Error(
          "Magic Eden via Ordit did not return a Taproot address",
        );
      }

      return {
        address: {
          ordinals: ordinalsAddress.address,
          payments: paymentsAddress.address,
        },
        publicKey: {
          ordinals: ordinalsAddress.publicKey,
          payments: paymentsAddress.publicKey,
        },
        format: {
          ordinals: ordinalsAddress.format,
          payments: paymentsAddress.format,
        },
      };
    }
    case Wallet.LEATHER: {
      const leather = await getLeatherAddresses(network);
      if (!leather || leather.length < 1) {
        throw new Error("Leather via Ordit returned no addresses");
      }

      const paymentsAddress = leather.find(
        (walletAddress) => walletAddress.format === "segwit",
      );
      if (!paymentsAddress) {
        throw new Error("Leather via Ordit did not return a Segwit address");
      }

      const ordinalsAddress = leather.find(
        (walletAddress) => walletAddress.format === "taproot",
      );
      if (!ordinalsAddress) {
        throw new Error("Leather via Ordit did not return a Taproot address");
      }

      return {
        address: {
          ordinals: ordinalsAddress.address,
          payments: paymentsAddress.address,
        },
        publicKey: {
          ordinals: ordinalsAddress.publicKey,
          payments: paymentsAddress.publicKey,
        },
        format: {
          ordinals: ordinalsAddress.format,
          payments: paymentsAddress.format,
        },
      };
    }
    case Wallet.OKX: {
      const okx = await getOKXAddresses(network);
      if (!okx || okx.length < 1) {
        throw new Error("OKX via Ordit returned no addresses");
      }

      const okxWallet = okx[0];
      return {
        address: {
          ordinals: okxWallet.address,
          payments: okxWallet.address,
        },
        publicKey: {
          ordinals: okxWallet.publicKey,
          payments: okxWallet.publicKey,
        },
        format: {
          ordinals: okxWallet.format,
          payments: okxWallet.format,
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
        { network, wallet },
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

  return { connectWallet: onConnect };
}
