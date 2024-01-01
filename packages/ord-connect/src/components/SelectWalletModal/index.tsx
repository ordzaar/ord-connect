import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  BrowserWalletNotInstalledError,
  BrowserWalletRequestCancelledByUserError,
} from "@ordzaar/ordit-sdk";
import { getAddresses as getUnisatAddresses } from "@ordzaar/ordit-sdk/unisat";
import { getAddresses as getXverseAddresses } from "@ordzaar/ordit-sdk/xverse";

import CloseModalIcon from "../../assets/close-modal.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useOrdConnect, Wallet } from "../../providers/OrdConnectProvider";
import { isMobileUserAgent } from "../../utils/mobile-detector";
import { waitForUnisatExtensionReady } from "../../utils/unisat";

import { WalletButton } from "./WalletButton";

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
  disableMobile?: boolean;
}

const WALLET_CHROME_EXTENSION_URL: Record<Wallet, string> = {
  [Wallet.UNISAT]: "https://unisat.io/download", // their www subdomain doesn't work
  [Wallet.XVERSE]: "https://www.xverse.app/download",
};

export function SelectWalletModal({
  isOpen,
  closeModal,
  disableMobile,
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
  const isSupportedDevice = !disableMobile || !isMobile;

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

      const p2sh = xverse.find(
        (walletAddress) => walletAddress.format === "p2sh-p2wpkh",
      );
      const taproot = xverse.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

      if (!p2sh || !taproot) {
        throw new Error(
          "Xverse via Ordit did not return P2SH or Taproot addresses.",
        );
      }

      updateAddress({
        ordinals: taproot.address,
        payments: p2sh.address,
      });
      updatePublicKey({
        ordinals: taproot.publicKey,
        payments: p2sh.publicKey,
      });
      updateWallet(Wallet.XVERSE);
      updateFormat({
        ordinals: taproot.format,
        payments: p2sh.format,
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

  // Reconnect address change listener if there there is already a connected wallet
  useEffect(() => {
    let isMounted = true;
    let isConnectSuccessful = false;
    const listener = () => onConnectUnisatWallet();

    if (wallet === Wallet.UNISAT && address && publicKey && format) {
      const connectToUnisatWalletOnLoad = async () => {
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
      connectToUnisatWalletOnLoad();
    }
    return () => {
      isMounted = false;
      if (isConnectSuccessful) {
        window.unisat.removeListener("accountsChanged", listener);
      }
    };
  }, []);

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
                    {isSupportedDevice
                      ? "Choose wallet to connect"
                      : "Unsupported device"}
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
                  {isSupportedDevice ? (
                    <section className="panel-content-inner-container">
                      {!isMobile && ( // TODO:: remove this once unisat supported on mobile devices
                        <>
                          <WalletButton
                            wallet={Wallet.UNISAT}
                            subtitle="Coming soon on mobile browsing"
                            onConnect={onConnectUnisatWallet}
                            icon={UnisatWalletIcon}
                            setErrorMessage={setErrorMessage}
                            isDisabled={isMobile} // disable unisat on mobile until it is supported
                            isMobileDevice={isMobile}
                          />
                          <hr className="horizontal-separator" />
                        </>
                      )}
                      <WalletButton
                        wallet={Wallet.XVERSE}
                        subtitle="Available on Xverse app"
                        onConnect={onConnectXverseWallet}
                        icon={XverseWalletIcon}
                        setErrorMessage={setErrorMessage}
                        isMobileDevice={isMobile}
                      />
                    </section>
                  ) : (
                    <Dialog.Description className="unsupported-browser-message">
                      This website does not support mobile devices.
                    </Dialog.Description>
                  )}
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
