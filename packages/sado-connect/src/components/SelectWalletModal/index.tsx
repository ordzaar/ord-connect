import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import CloseModalIcon from "../../assets/close-modal.svg";
import ChevronRightIcon from "../../assets/chevron-right.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useSadoContext, Wallet } from "../../providers/SadoContext";
import {
  UNISAT_WALLET_CHROME_EXTENSION_URL,
  XVERSE_WALLET_CHROME_EXTENSION_URL,
} from "../../utils/constant";
import { AddressFormats, ordit } from "@sadoprotocol/ordit-sdk";

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
}

export function SelectWalletModal({
  isOpen,
  closeModal,
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
  } = useSadoContext();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isChromium = window.chrome;

  const onConnectUnisatWallet = async () => {
    try {
      window.unisat.removeListener("accountsChanged", onConnectUnisatWallet);
    } catch (err: any) {
      // This will fail on first run, handle it silently
    }
    try {
      // Reset error message
      setErrorMessage("");
      const unisat = await ordit.unisat.getAddresses(network);

      // Unisat only returns one wallet by default
      const unisatWallet = unisat[0];
      updateAddress(unisatWallet.address);
      updatePublicKey(unisatWallet.pub);
      updateWallet(Wallet.UNISAT);
      updateFormat(unisatWallet.format as AddressFormats);

      window.unisat.addListener("accountsChanged", onConnectUnisatWallet);
      closeModal();
    } catch (err: any) {
      if (err.message === "Unisat not installed.") {
        window.open(UNISAT_WALLET_CHROME_EXTENSION_URL);
      }
      setErrorMessage(err.message ?? err.toString());
      console.error("Error while connecting to UniSat wallet", err);
    }
  };
  const onConnectXverseWallet = async () => {
    try {
      const xverse = await ordit.xverse.getAddresses({
        network,
      });
      const xverseWallet = xverse[0];
      updateAddress(xverseWallet.address);
      updatePublicKey(xverseWallet.pub);
      updateWallet(Wallet.XVERSE);
      updateFormat(xverseWallet.format as AddressFormats);
      closeModal();
    } catch (err: any) {
      if (err?.message === "Xverse not installed.") {
        window.open(XVERSE_WALLET_CHROME_EXTENSION_URL);
      }
      setErrorMessage(err.toString());
      console.error("Error while connecting to Xverse wallet", err);
    }
  };

  // Reconnect address change listener if there there is already a connected wallet
  useEffect(() => {
    if (wallet === Wallet.UNISAT && address && publicKey && format) {
      onConnectUnisatWallet();
    }
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="sado-connect-wallet-modal"
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
                    {isChromium
                      ? "Choose wallet to connect"
                      : "Unsupported Browser"}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="close-button"
                  >
                    <img src={CloseModalIcon} />
                  </button>
                </section>

                <section className="panel-content-container">
                  {isChromium ? (
                    <section className="panel-content-inner-container">
                      <button
                        type="button"
                        className="wallet-option-button"
                        onClick={async () => {
                          await onConnectUnisatWallet();
                        }}
                      >
                        <img src={UnisatWalletIcon} alt="Unisat Wallet" />
                        <span className="wallet-option-label">
                          Unisat wallet
                        </span>
                        <img src={ChevronRightIcon} alt="Chevron Right" />
                      </button>
                      <hr className="horizontal-separator" />
                      <button
                        type="button"
                        className="wallet-option-button"
                        onClick={async () => {
                          await onConnectXverseWallet();
                        }}
                      >
                        <img src={XverseWalletIcon} alt="Xverse Wallet" />
                        <span className="wallet-option-label">Xverse</span>
                        <img src={ChevronRightIcon} alt="Chevron Right" />
                      </button>
                    </section>
                  ) : (
                    <>
                      <Dialog.Description className="unsupported-browser-message">
                        To connect to your wallet, please download Google Chrome
                        or any other Chromium-based browser.
                      </Dialog.Description>
                    </>
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
