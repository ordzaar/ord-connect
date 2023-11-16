import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  AddressFormat,
  BrowserWalletNotInstalledError,
} from "@ordzaar/ordit-sdk";
import { getAddresses as getUnisatAddresses } from "@ordzaar/ordit-sdk/unisat";
import { getAddresses as getXverseAddresses } from "@ordzaar/ordit-sdk/xverse";

import CloseModalIcon from "../../assets/close-modal.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useOrdContext, Wallet } from "../../providers/OrdContext";
import { isMobileDevice } from "../../utils/mobile-detector.ts";

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
  } = useOrdContext();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isSupportedDevice = !disableMobile || !isMobileDevice();

  const onError = useCallback((walletProvider: Wallet, err: unknown) => {
    if (err instanceof BrowserWalletNotInstalledError) {
      window.open(
        WALLET_CHROME_EXTENSION_URL[walletProvider],
        "_blank",
        "noopener,noreferrer",
      );
    }
    if (err instanceof Error) {
      setErrorMessage(err.toString());
    } else {
      // safeguard as we don't throw string errors
      setErrorMessage("Unknown error occurred.");
    }
    console.error(`Error while connecting to ${walletProvider} wallet`, err);
  }, []);

  const onConnectUnisatWallet = async (readOnly?: boolean) => {
    try {
      window.unisat.removeListener("accountsChanged", () =>
        onConnectUnisatWallet(),
      );
    } catch (_) {
      // This will fail on first run, handle it silently
    }
    try {
      // Reset error message
      setErrorMessage("");
      const unisat = await getUnisatAddresses(network, readOnly);

      if (!unisat || unisat.length < 1) {
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
        ordinals: unisatWallet.format as AddressFormat,
        payments: unisatWallet.format as AddressFormat,
      });

      window.unisat.addListener("accountsChanged", () =>
        onConnectUnisatWallet(),
      );
      closeModal();
      return true;
    } catch (err: unknown) {
      onError(Wallet.UNISAT, err);
      return false;
    }
  };
  const onConnectXverseWallet = async () => {
    try {
      setErrorMessage("");
      const xverse = await getXverseAddresses(network);
      // P2SH-P2WPKH = BTC
      // Taproot = Ordinals / Inscriptions
      if (!xverse || xverse.length < 1) {
        throw new Error("Xverse via Ordit returned no addresses.");
      }

      const p2sh = xverse.find(
        (walletAddress) => walletAddress.format === "p2sh-p2wpkh",
      );
      const taproot = xverse.find(
        (walletAddress) => walletAddress.format === "taproot",
      );

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
        ordinals: taproot.format as AddressFormat,
        payments: p2sh.format as AddressFormat,
      });
      closeModal();
      return true;
    } catch (err: unknown) {
      onError(Wallet.XVERSE, err);
      return false;
    }
  };

  // Reconnect address change listener if there there is already a connected wallet
  useEffect(() => {
    if (wallet === Wallet.UNISAT && address && publicKey && format) {
      onConnectUnisatWallet(true);
    }
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="ord-connect-wallet-modal"
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
                      {!isMobileDevice() && ( // TODO:: remove this once unisat supported on mobile devices
                        <>
                          <WalletButton
                            name="Unisat Wallet"
                            info="Coming soon on mobile browsing"
                            onConnect={onConnectUnisatWallet}
                            icon={UnisatWalletIcon}
                            setErrorMessage={setErrorMessage}
                            isDisabled={isMobileDevice()} // disable unisat on mobile until it is supported
                            isMobileDevice={isMobileDevice()}
                          />
                          <hr className="horizontal-separator" />
                        </>
                      )}
                      <WalletButton
                        name="Xverse"
                        info="Available on Xverse app"
                        onConnect={onConnectXverseWallet}
                        icon={XverseWalletIcon}
                        setErrorMessage={setErrorMessage}
                        isMobileDevice={isMobileDevice()}
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
