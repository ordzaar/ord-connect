import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { AddressFormats, ordit } from "@sadoprotocol/ordit-sdk";
import CloseModalIcon from "../../assets/close-modal.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useOrdContext, Wallet } from "../../providers/OrdContext.tsx";
import {
  UNISAT_WALLET_CHROME_EXTENSION_URL,
  XVERSE_WALLET_CHROME_EXTENSION_URL,
} from "../../utils/constant";
import { WalletButton } from "./WalletButton";

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
  } = useOrdContext();
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

      if (!unisat || unisat.length < 1) {
        throw Error("Unisat via Ordit returned no addresses.");
      }

      // Unisat only returns one wallet by default
      const unisatWallet = unisat[0];
      updateAddress({
        ordinals: unisatWallet.address,
        payments: unisatWallet.address,
      });
      updatePublicKey({
        ordinals: unisatWallet.pub,
        payments: unisatWallet.pub,
      });
      updateWallet(Wallet.UNISAT);
      updateFormat({
        ordinals: unisatWallet.format as AddressFormats,
        payments: unisatWallet.format as AddressFormats,
      });

      window.unisat.addListener("accountsChanged", onConnectUnisatWallet);
      closeModal();
      return true;
    } catch (err: any) {
      if (err.message === "Unisat not installed.") {
        window.open(
          UNISAT_WALLET_CHROME_EXTENSION_URL,
          "_blank",
          "noopener,noreferrer",
        );
      }
      setErrorMessage(err.message ?? err.toString());
      console.error("Error while connecting to UniSat wallet", err);
      return false;
    }
  };
  const onConnectXverseWallet = async () => {
    try {
      setErrorMessage("");
      const xverse = await ordit.xverse.getAddresses({
        network,
      });
      // Nested Segwit = BTC
      // Taproot = Ordinals / Inscriptions
      if (!xverse || xverse.length < 1) {
        throw Error("Xverse via Ordit returned no addresses.");
      }

      // Xverse's address format resolution may fail
      // While we can resolve it via ordit-sdk, it is most likely a broken state with Xverse (it's set to Testnet, but returns Mainnet addresses/public keys)
      // So, just throw an error
      if (xverse.some((x) => x.format === "unknown")) {
        // xverse = xverse.map(x => ({...x, format: getAddressFormat(x.address, network).format}))
        throw Error(
          "Xverse extension is misbehaving. Try to toggle between your networks. E.g. Switch to Mainnet then to Testnet or vice-versa.",
        );
      }

      const nestedSegwit = xverse.find((a) => a.format === "nested-segwit");
      const taproot = xverse.find((a) => a.format === "taproot");

      updateAddress({
        ordinals: taproot.address,
        payments: nestedSegwit.address,
      });
      updatePublicKey({ ordinals: taproot.pub, payments: nestedSegwit.pub });
      updateWallet(Wallet.XVERSE);
      updateFormat({
        ordinals: taproot.format as AddressFormats,
        payments: nestedSegwit.format as AddressFormats,
      });
      closeModal();
      return true;
    } catch (err: any) {
      if (err?.message === "Xverse not installed.") {
        window.open(
          XVERSE_WALLET_CHROME_EXTENSION_URL,
          "_blank",
          "noopener,noreferrer",
        );
      }
      setErrorMessage(err.toString());
      console.error("Error while connecting to Xverse wallet", err);
      return false;
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
                    {isChromium
                      ? "Choose wallet to connect"
                      : "Unsupported Browser"}
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
                  {isChromium ? (
                    <section className="panel-content-inner-container">
                      <WalletButton
                        name="Unisat"
                        onConnect={onConnectUnisatWallet}
                        icon={UnisatWalletIcon}
                        setErrorMessage={setErrorMessage}
                      />
                      <hr className="horizontal-separator" />
                      <WalletButton
                        name="Xverse"
                        onConnect={onConnectXverseWallet}
                        icon={XverseWalletIcon}
                        setErrorMessage={setErrorMessage}
                      />
                    </section>
                  ) : (
                    <Dialog.Description className="unsupported-browser-message">
                      To connect to your wallet, please download Google Chrome
                      or any other Chromium-based browser.
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
