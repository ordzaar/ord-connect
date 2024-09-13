import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

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

import { useConnect } from "./hooks/useConnect";
import { WalletButton, WalletButtonProps } from "./WalletButton";

type WalletListItemProp = Omit<
  WalletButtonProps,
  "onError" | "renderAvatar"
> & {
  hidden?: boolean;
  order: number;
};

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
  preferredWallet?: Wallet;
  walletsOrder?: Wallet[];
}

export function SelectWalletModal({
  isOpen,
  closeModal,
  renderAvatar,
  preferredWallet,
  walletsOrder,
}: SelectWalletModalProp) {
  const [errorMessage, setErrorMessage] = useState("");
  const { connectWallet } = useConnect({
    onClose: closeModal,
    onError: (error) => setErrorMessage(error),
  });
  const { network, wallet, format, address, publicKey, disconnectWallet } =
    useOrdConnect();

  // Reconnect address change listener if there there is already a connected wallet
  useEffect(() => {
    if (wallet !== Wallet.UNISAT) {
      return undefined;
    }

    let isMounted = true;
    let isConnectSuccessful = false;
    const listener = () => connectWallet(Wallet.UNISAT);

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

        isConnectSuccessful = await connectWallet(Wallet.UNISAT, {
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
  }, [wallet, connectWallet, disconnectWallet]);

  const isMobile = isMobileUserAgent();
  const orderedWalletList = useMemo<WalletListItemProp[]>(() => {
    const walletList: WalletListItemProp[] = [
      {
        wallet: Wallet.OKX,
        subtitle: "Available on OKX app",
        onConnect: () => connectWallet(Wallet.OKX),
        icon: OKXWalletIcon,
        hidden: isMobile && network !== Network.MAINNET,
        order: 20,
      },
      {
        wallet: Wallet.UNISAT,
        subtitle: "Coming soon on mobile browsing",
        onConnect: () => connectWallet(Wallet.UNISAT),
        icon: UnisatWalletIcon,
        hidden: isMobile,
        order: 21,
      },
      {
        wallet: Wallet.XVERSE,
        subtitle: "Available on Xverse app",
        onConnect: () => connectWallet(Wallet.XVERSE),
        icon: XverseWalletIcon,
        order: 22,
      },
      {
        wallet: Wallet.MAGICEDEN,
        subtitle: "Coming soon on mobile browsing",
        onConnect: () => connectWallet(Wallet.MAGICEDEN),
        icon: MagicEdenWalletIcon,
        hidden: isMobile,
        order: 23,
      },
      {
        wallet: Wallet.LEATHER,
        subtitle: "Coming soon on mobile browsing",
        onConnect: () => connectWallet(Wallet.LEATHER),
        icon: LeatherWalletIcon,
        hidden: isMobile,
        order: 24,
      },
    ];

    if (!walletsOrder) {
      return walletList;
    }

    const updatedList = walletList.map((walletItem) => {
      const foundIndex = walletsOrder.findIndex(
        (data) => data === walletItem.wallet,
      );
      if (foundIndex >= 0) {
        return { ...walletItem, order: foundIndex };
      }
      return walletItem;
    });

    return updatedList.sort((a, b) => a.order - b.order);
  }, [walletsOrder, isMobile, network, connectWallet]);

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
                    <img src={CloseModalIcon} alt="Close" />
                  </button>
                </section>

                <section className="panel-content-container">
                  <section className="panel-content-inner-container">
                    {orderedWalletList.map((walletItem, index) => {
                      if (walletItem.hidden) {
                        return null;
                      }

                      const isLastItem = index === orderedWalletList.length - 1;
                      return (
                        <Fragment key={walletItem.wallet}>
                          <WalletButton
                            wallet={walletItem.wallet}
                            subtitle={walletItem.subtitle}
                            onConnect={async () => {
                              setErrorMessage("");
                              return walletItem.onConnect();
                            }}
                            onError={(err) => setErrorMessage(err)}
                            icon={walletItem.icon}
                            renderAvatar={renderAvatar}
                            isPreferred={preferredWallet === walletItem.wallet}
                          />
                          {!isLastItem && (
                            <hr className="horizontal-separator" />
                          )}
                        </Fragment>
                      );
                    })}
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
