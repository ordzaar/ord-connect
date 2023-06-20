import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import CloseModalIcon from "../assets/close-modal.svg";
import ChevronRightIcon from "../assets/chevron-right.svg";
import UnisatWalletIcon from "../assets/unisat-wallet.svg";
import XverseWalletIcon from "../assets/xverse-wallet.svg";

interface SelectWalletModalProp {
  isOpen: boolean;
  closeModal: () => void;
}

export const SelectWalletModal = ({
  isOpen,
  closeModal,
}: SelectWalletModalProp) => {
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
                    onClick={closeModal}
                  >
                    <img src={UnisatWalletIcon} />
                    <span className="wallet-option-label">Unisat wallet</span>
                    <img src={ChevronRightIcon} />
                  </button>
                  <hr className="horizontal-separator" />
                  <button
                    type="button"
                    className="wallet-option-button"
                    onClick={closeModal}
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
};
