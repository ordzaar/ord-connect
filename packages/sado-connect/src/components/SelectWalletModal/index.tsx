import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import CloseModalIcon from "../../assets/close-modal.svg";
import ChevronRightIcon from "../../assets/chevron-right.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { AddressPurposes, GetAddressOptions, getAddress } from "sats-connect";
import { useAddressContext } from "../../providers/AddressContext";

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
}

export function SelectWalletModal({
  isOpen,
  closeModal,
}: SelectWalletModalProp) {
  const { updateAddress } = useAddressContext();

  const onConnectUnisatWallet = async () => {
    const UNISAT_WALLET_CHROME_EXTENSION_URL =
      "https://chrome.google.com/webstore/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo";

    try {
      if (typeof (window as any).unisat === "undefined") {
        window.open(UNISAT_WALLET_CHROME_EXTENSION_URL);
        throw Error("UniSat browser extension is not installed");
      }

      const accounts = await (window as any).unisat.requestAccounts();
      if (accounts.length === 0) {
        throw Error("No address found in UniSat wallet");
      }

      console.log(accounts);
      updateAddress(accounts[0]);
      closeModal();
    } catch (err) {
      console.error("Error while connecting to UniSat wallet", err);
    }
  };

  const onConnectXverseWallet = async () => {
    const XVERSE_WALLET_CHROME_EXTENSION_URL =
      "https://chrome.google.com/webstore/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg";

    try {
      const getXverseAddressOptions: GetAddressOptions = {
        payload: {
          purposes: [AddressPurposes.ORDINALS, AddressPurposes.PAYMENT],
          message: "Address for receiving Ordinals and payments",
          network: {
            type: "Mainnet",
          },
        },
        onFinish: (response) => {
          console.log(response);
          if (response.addresses.length === 0) {
            throw Error("No address found in UniSat wallet");
          }
          updateAddress(response.addresses[0].address);
        },
        onCancel: () =>
          console.log("Request to access Xverse wallet is cancelled"),
      };

      await getAddress(getXverseAddressOptions);
      closeModal();
    } catch (err) {
      const { message } = err as Error;
      if (message === "No Bitcoin Wallet installed") {
        window.open(XVERSE_WALLET_CHROME_EXTENSION_URL);
      }
      console.error("Error while connecting to Xverse wallet", err);
    }
  };

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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </section>
      </Dialog>
    </Transition>
  );
}
