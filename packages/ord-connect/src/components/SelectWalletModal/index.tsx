import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  BrowserWalletNotInstalledError,
  BrowserWalletRequestCancelledByUserError,
} from "@ordzaar/ordit-sdk";
import { getAddresses as getLeatherAddresses } from "@ordzaar/ordit-sdk/leather";
import { getAddresses as getMagicEdenAddress } from "@ordzaar/ordit-sdk/magiceden";
import { getAddresses as getOKXAddresses } from "@ordzaar/ordit-sdk/okx";
import { getAddresses as getUnisatAddresses } from "@ordzaar/ordit-sdk/unisat";
import { getAddresses as getXverseAddresses } from "@ordzaar/ordit-sdk/xverse";

import CloseModalIcon from "../../assets/close-modal.svg";
import LeatherWalletIcon from "../../assets/leather-wallet.svg";
import MagicEdenWalletIcon from "../../assets/magiceden-wallet.svg";
import OKXWalletIcon from "../../assets/okx-wallet.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import {
  Network,
  useOrdConnect,
  Wallet,
} from "../../providers/OrdConnectProvider";
import { isMobileUserAgent } from "../../utils/mobile-detector";
import { waitForUnisatExtensionReady } from "../../utils/unisat";

import { WalletButton, WalletButtonProp } from "./WalletButton";

interface WalletListItemProp extends WalletButtonProp {
  isAvailable: boolean;
}

export type WalletOrderType = [Wallet, Wallet?, Wallet?, Wallet?, Wallet?];

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
  preferredWallet?: Wallet;
  walletsOrder?: WalletOrderType;
}

const WALLET_CHROME_EXTENSION_URL: Record<Wallet, string> = {
  [Wallet.OKX]: "https://www.okx.com/web3",
  [Wallet.MAGICEDEN]: "https://wallet.magiceden.io/",
  [Wallet.UNISAT]: "https://unisat.io/download", // their www subdomain doesn't work
  [Wallet.XVERSE]: "https://www.xverse.app/download",
  [Wallet.LEATHER]: "https://leather.io/install-extension",
};

export function SelectWalletModal({
  isOpen,
  closeModal,
  renderAvatar,
  preferredWallet,
  walletsOrder,
}: SelectWalletModalProp) {
  const {
    updateAddress,
    network,
    updateWallet,
    updatePublicKey,
    updateFormat,
    wallet,
    format,
    address,
    publicKey,
    disconnectWallet,
  } = useOrdConnect();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isMobile = isMobileUserAgent();

  const onError = useCallback(
    (
      walletProvider: Wallet,
      err:
        | BrowserWalletNotInstalledError
        | BrowserWalletRequestCancelledByUserError
        | Error,
    ) => {
      if (err instanceof BrowserWalletNotInstalledError) {
        window.open(
          WALLET_CHROME_EXTENSION_URL[walletProvider],
          "_blank",
          "noopener,noreferrer",
        );
      }
      setErrorMessage(err.message ?? err.toString());
      console.error(`Error while connecting to ${walletProvider} wallet`, err);
      disconnectWallet();
    },
    [disconnectWallet],
  );

  const onConnectMagicEdenWallet = useCallback(async () => {
    if (network === "testnet") {
      const unsupportedNetworkError = new Error(
        "Magic Eden wallet is not supported on testnet",
      );
      onError(Wallet.MAGICEDEN, unsupportedNetworkError);
      return false;
    }

    try {
      setErrorMessage("");
      const magicEdenAddresses = await getMagicEdenAddress(network);
      if (!magicEdenAddresses || magicEdenAddresses.length < 1) {
        disconnectWallet();
        throw new Error("Magic Eden via Ordit returned no addresses.");
      }

      // Magic Eden provides a segwit address by default for sending and receiving payments
      // Imported xverse wallets will return a p2sh address for payments by default instead
      const paymentAddress = magicEdenAddresses.find(
        (walletAddress) =>
          walletAddress.format === "segwit" ||
          walletAddress.format === "p2sh-p2wpkh",
      );

      if (!paymentAddress) {
        throw new Error(
          "Magic Eden via Ordit did not return a P2SH or Segwit address.",
        );
      }

      const ordinalsAddress = magicEdenAddresses.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

      if (!ordinalsAddress) {
        throw new Error(
          "Magic Eden via Ordit did not return a Taproot address.",
        );
      }

      updateAddress({
        ordinals: ordinalsAddress.address,
        payments: paymentAddress.address,
      });
      updatePublicKey({
        ordinals: ordinalsAddress.publicKey,
        payments: paymentAddress.publicKey,
      });
      updateWallet(Wallet.MAGICEDEN);
      updateFormat({
        ordinals: ordinalsAddress.format,
        payments: paymentAddress.format,
      });
      closeModal();
      return true;
    } catch (err) {
      onError(Wallet.MAGICEDEN, err as Error);
      return false;
    }
  }, [
    closeModal,
    disconnectWallet,
    network,
    onError,
    updateAddress,
    updateFormat,
    updatePublicKey,
    updateWallet,
  ]);

  const onConnectUnisatWallet = useCallback(
    async ({ readOnly }: { readOnly?: boolean } = {}) => {
      try {
        // Reset error message
        setErrorMessage("");
        const unisat = await getUnisatAddresses(network, readOnly);

        if (!unisat || unisat.length < 1) {
          disconnectWallet();
          throw new Error("Unisat via Ordit returned no addresses.");
        }

        // Unisat only returns one wallet by default
        const unisatWallet = unisat[0];
        updateAddress({
          ordinals: unisatWallet.address,
          payments: unisatWallet.address,
        });
        updatePublicKey({
          ordinals: unisatWallet.publicKey,
          payments: unisatWallet.publicKey,
        });
        updateWallet(Wallet.UNISAT);
        updateFormat({
          ordinals: unisatWallet.format,
          payments: unisatWallet.format,
        });

        closeModal();
        return true;
      } catch (err) {
        onError(Wallet.UNISAT, err as Error);
        return false;
      }
    },
    [
      closeModal,
      disconnectWallet,
      network,
      onError,
      updateAddress,
      updateFormat,
      updatePublicKey,
      updateWallet,
    ],
  );

  const onConnectXverseWallet = useCallback(async () => {
    try {
      setErrorMessage("");
      const xverse = await getXverseAddresses(network);
      // P2SH-P2WPKH = BTC
      // Taproot = Ordinals / Inscriptions
      if (!xverse || xverse.length < 1) {
        disconnectWallet();
        throw new Error("Xverse via Ordit returned no addresses.");
      }

      // Xverse provides a nested segwit address by default for sending and receiving payments
      // Ledger wallets on Xverse will return a native segwit address for payments instead
      const paymentAddress = xverse.find(
        (walletAddress) =>
          walletAddress.format === "p2sh-p2wpkh" ||
          walletAddress.format === "segwit",
      );

      if (!paymentAddress) {
        throw new Error(
          "Xverse via Ordit did not return a P2SH or Segwit address.",
        );
      }

      const ordinalsAddress = xverse.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

      if (!ordinalsAddress) {
        throw new Error("Xverse via Ordit did not return a Taproot address.");
      }

      updateAddress({
        ordinals: ordinalsAddress.address,
        payments: paymentAddress.address,
      });
      updatePublicKey({
        ordinals: ordinalsAddress.publicKey,
        payments: paymentAddress.publicKey,
      });
      updateWallet(Wallet.XVERSE);
      updateFormat({
        ordinals: ordinalsAddress.format,
        payments: paymentAddress.format,
      });
      closeModal();
      return true;
    } catch (err) {
      onError(Wallet.XVERSE, err as Error);
      return false;
    }
  }, [
    closeModal,
    disconnectWallet,
    network,
    onError,
    updateAddress,
    updateFormat,
    updatePublicKey,
    updateWallet,
  ]);

  const onConnectLeatherWallet = useCallback(async () => {
    try {
      setErrorMessage("");
      const leather = await getLeatherAddresses(network);
      if (!leather || leather.length < 1) {
        disconnectWallet();
        throw new Error("Leather via Ordit returned no addresses.");
      }

      const paymentAddress = leather.find(
        (walletAddress) => walletAddress.format === "segwit",
      );
      if (!paymentAddress) {
        throw new Error("Leather via Ordit did not return a Segwit address.");
      }

      const ordinalAddress = leather.find(
        (walletAddress) => walletAddress.format === "taproot",
      );
      if (!ordinalAddress) {
        throw new Error("Leather via Ordit did not return a Taproot address.");
      }

      updateAddress({
        ordinals: ordinalAddress.address,
        payments: paymentAddress.address,
      });
      updatePublicKey({
        ordinals: ordinalAddress.publicKey,
        payments: paymentAddress.publicKey,
      });
      updateWallet(Wallet.LEATHER);
      updateFormat({
        ordinals: ordinalAddress.format,
        payments: paymentAddress.format,
      });
      closeModal();
      return true;
    } catch (err) {
      onError(Wallet.LEATHER, err as Error);
      return false;
    }
  }, [
    closeModal,
    disconnectWallet,
    network,
    onError,
    updateAddress,
    updateFormat,
    updatePublicKey,
    updateWallet,
  ]);

  const onConnectOKXWallet = useCallback(async () => {
    try {
      setErrorMessage("");
      const okx = await getOKXAddresses(network);
      if (!okx || okx.length < 1) {
        disconnectWallet();
        throw new Error("OKX via Ordit returned no addresses.");
      }

      const okxWallet = okx[0];
      updateAddress({
        ordinals: okxWallet.address,
        payments: okxWallet.address,
      });
      updatePublicKey({
        ordinals: okxWallet.publicKey,
        payments: okxWallet.publicKey,
      });
      updateWallet(Wallet.OKX);
      updateFormat({
        ordinals: okxWallet.format,
        payments: okxWallet.format,
      });
      closeModal();
      return true;
    } catch (err) {
      onError(Wallet.OKX, err as Error);
      return false;
    }
  }, [
    closeModal,
    disconnectWallet,
    network,
    onError,
    updateAddress,
    updateFormat,
    updatePublicKey,
    updateWallet,
  ]);

  // Reconnect address change listener if there there is already a connected wallet
  useEffect(() => {
    if (wallet !== Wallet.UNISAT) {
      return undefined;
    }

    let isMounted = true;
    let isConnectSuccessful = false;
    const listener = () => onConnectUnisatWallet();

    if (address && publicKey && format) {
      const connectToUnisatWalletOnReady = async () => {
        const isUnisatExtensionReady = await waitForUnisatExtensionReady();
        if (!isMounted) {
          return;
        }
        if (!isUnisatExtensionReady) {
          disconnectWallet();
          return;
        }

        isConnectSuccessful = await onConnectUnisatWallet({ readOnly: true });
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
  }, [wallet, onConnectUnisatWallet, disconnectWallet]);

  const orderedWalletList = useMemo<WalletListItemProp[]>(() => {
    const walletList: WalletListItemProp[] = [
      {
        wallet: Wallet.OKX,
        subtitle: "Available on OKX app",
        onConnect: onConnectOKXWallet,
        icon: OKXWalletIcon,
        setErrorMessage,
        isMobileDevice: isMobile,
        renderAvatar,
        isAvailable: !isMobile || (isMobile && network === Network.MAINNET),
      },
      {
        wallet: Wallet.UNISAT,
        subtitle: "Coming soon on mobile browsing",
        onConnect: onConnectUnisatWallet,
        icon: UnisatWalletIcon,
        setErrorMessage,
        isMobileDevice: isMobile,
        renderAvatar,
        isAvailable: !isMobile,
      },
      {
        wallet: Wallet.XVERSE,
        subtitle: "Available on Xverse app",
        onConnect: onConnectXverseWallet,
        icon: XverseWalletIcon,
        setErrorMessage,
        isMobileDevice: isMobile,
        renderAvatar,
        isAvailable: true,
      },
      {
        wallet: Wallet.MAGICEDEN,
        subtitle: "Coming soon on mobile browsing",
        onConnect: onConnectMagicEdenWallet,
        icon: MagicEdenWalletIcon,
        setErrorMessage,
        isDisabled: isMobile,
        isMobileDevice: isMobile,
        renderAvatar,
        isAvailable: !isMobile,
      },
      {
        wallet: Wallet.LEATHER,
        subtitle: "Coming soon on mobile browsing",
        onConnect: onConnectLeatherWallet,
        icon: LeatherWalletIcon,
        setErrorMessage,
        isDisabled: isMobile,
        isMobileDevice: isMobile,
        renderAvatar,
        isAvailable: !isMobile,
      },
    ];

    if (!walletsOrder) {
      return walletList;
    }

    const newList = walletsOrder.reduce<WalletListItemProp[]>(
      (list, walletItem) => {
        const foundWallet = walletList.find(
          (data) => data.wallet === walletItem,
        );
        const alreadyExist = list.some((data) => data.wallet === walletItem);
        if (foundWallet && !alreadyExist) {
          list.push(foundWallet);
        }
        return list;
      },
      [],
    );

    if (newList.length >= Object.keys(Wallet).length) {
      return newList;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const walletItem of walletList) {
      const alreadyExist = newList.some(
        (data) => data.wallet === walletItem.wallet,
      );
      if (!alreadyExist) {
        newList.push(walletItem);
      }
    }

    return newList;
  }, [
    walletsOrder,
    isMobile,
    network,
    onConnectLeatherWallet,
    onConnectMagicEdenWallet,
    onConnectOKXWallet,
    onConnectUnisatWallet,
    onConnectXverseWallet,
    renderAvatar,
  ]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="ord-connect-font ord-connect-wallet-modal"
        onClose={closeModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <section className="backdrop" />
        </Transition.Child>

        <section className="outer-container">
          <div className="inner-container">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="panel">
                <section className="panel-title-container">
                  <Dialog.Title as="h3" className="panel-title">
                    Choose Bitcoin wallet to connect
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="close-button"
                  >
                    <img src={CloseModalIcon} alt="close modal" />
                  </button>
                </section>

                <section className="panel-content-container">
                  <section className="panel-content-inner-container">
                    {orderedWalletList.map(
                      (walletItem: WalletListItemProp, index: number) => {
                        if (!walletItem.isAvailable) {
                          return null;
                        }

                        const isLastItem =
                          index === orderedWalletList.length - 1;
                        return (
                          <>
                            <WalletButton
                              wallet={walletItem.wallet}
                              subtitle={walletItem.subtitle}
                              onConnect={walletItem.onConnect}
                              icon={walletItem.icon}
                              setErrorMessage={walletItem.setErrorMessage}
                              isMobileDevice={walletItem.isMobileDevice}
                              renderAvatar={walletItem.renderAvatar}
                              isPreferred={
                                preferredWallet === walletItem.wallet
                              }
                            />
                            {!isLastItem && (
                              <hr className="horizontal-separator" />
                            )}
                          </>
                        );
                      },
                    )}
                  </section>
                  <p className="error-message">{errorMessage}</p>
                </section>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </section>
      </Dialog>
    </Transition>
  );
}
