import { useOrdConnect } from "../providers/OrdConnectProvider";

import { PostConnectButton } from "./PostConnectButton";
import { PreConnectButton } from "./PreConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

import "./style.css";

export interface OrdConnectKitProp {
  customStyle?: string;
  onViewProfile?: () => void;
  onChangeWallet?: () => void;
  disableMobile?: boolean;
}

/**
 * Parent React component for OrdConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the OrdConnectKit component.
 * @param {string} [props.customStyle] - Custom CSS style for the button.
 * @param {Function} [props.onViewProfile] - Callback function to handle viewing wallet profile.
 * @param {Function} [props.onChangeWallet] - Callback function to handle changing wallet.
 * @returns {JSX.Element} OrdConnectKit React component.
 */
export function OrdConnectKit({
  customStyle,
  onViewProfile,
  onChangeWallet,
  disableMobile,
}: OrdConnectKitProp) {
  const { address, network, isModalOpen, openModal, closeModal } =
    useOrdConnect();

  return (
    <>
      {address?.ordinals ? (
        <PostConnectButton
          address={address.ordinals}
          network={network}
          onViewProfile={onViewProfile}
          onChangeWallet={onChangeWallet}
        />
      ) : (
        <PreConnectButton openModal={openModal} customStyle={customStyle} />
      )}

      <SelectWalletModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        disableMobile={disableMobile}
      />
    </>
  );
}
