import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import CloseModalIcon from "../../assets/close-modal.svg";
import ChevronRightIcon from "../../assets/chevron-right.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useAddressContext } from "../../providers/AddressContext";
import { GetWalletModel } from "../../types/OrditSdk";
import {
  // UNISAT_WALLET_CHROME_EXTENSION_URL,
  XVERSE_WALLET_CHROME_EXTENSION_URL,
} from "../../utils/constant";
import { ordit } from "@sadoprotocol/ordit-sdk";

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
}

export function SelectWalletModal({
  isOpen,
  closeModal,
}: SelectWalletModalProp) {
  const { updateAddress } = useAddressContext();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onConnectUnisatWallet = async () => {
    try {
      await ordit.unisat.getAddresses("testnet");
    } catch (err) {
      setErrorMessage((err as any).toString());
      console.error("Error while connecting to UniSat wallet", err);
    } finally {
      closeModal();
    }
  };

  const onConnectXverseWallet = async () => {
    try {
      await (window as any).ordit.sdk.wallet.get(
        {
          connect: "xverse",
        },
        (resp: GetWalletModel) => {
          console.log(resp);
          updateAddress(resp.data.addresses[0].address);
          closeModal();
        }
      );
    } catch (err) {
      setErrorMessage((err as any).toString());
      console.error("Error while connecting to Xverse wallet", err);
    }
  };

  useEffect(() => {
    const updateErrorMessage = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message;

      if (errorMessage === "No Bitcoin Wallet installed") {
        window.open(XVERSE_WALLET_CHROME_EXTENSION_URL);
      }
      setErrorMessage(errorMessage);
    };
    window.addEventListener("unhandledrejection", updateErrorMessage);

    return () =>
      window.removeEventListener("unhandledrejection", updateErrorMessage);
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
              enterTo="opacity-50 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="panel max-w-md transform p-6 align-middle shadow-xl transition-all">
                <section className="panel-title-container">
                  <Dialog.Title as="h3" className="panel-title">
                    Choose wallet to connect
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
                  <section className="panel-content-inner-container">
                    <button
                      type="button"
                      className="wallet-option-button"
                      onClick={async () => {
                        await onConnectUnisatWallet();
                      }}
                    >
                      <img src={UnisatWalletIcon} />
                      <span className="wallet-option-label">Unisat wallet</span>
                      <img src={ChevronRightIcon} />
                    </button>
                    <hr className="horizontal-separator" />
                    <button
                      type="button"
                      className="wallet-option-button"
                      onClick={async () => {
                        await onConnectXverseWallet();
                      }}
                    >
                      <img src={XverseWalletIcon} />
                      <span className="wallet-option-label">Xverse</span>
                      <img src={ChevronRightIcon} />
                    </button>
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
