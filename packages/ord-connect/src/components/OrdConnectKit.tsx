import { ReactNode } from "react";

import { useOrdConnect } from "../providers/OrdConnectProvider";

import { PostConnectButton } from "./PostConnectButton";
import { PreConnectButton } from "./PreConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

import "./style.css";

export interface OrdConnectKitProp {
  hideConnectButton?: boolean;
  onViewProfile?: () => void;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
}

/**
 * Parent React component for OrdConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the OrdConnectKit component.
 * @param {boolean} [props.hideConnectButton] - Hides the connect and connected status button.
 * @param {Function} [props.renderAvatar] - Render prop for rendering wallet profile avatar when connected.
 * @param {Function} [props.onViewProfile] - Callback function to handle viewing wallet profile.
 * @returns {JSX.Element} OrdConnectKit React component.
 */
export function OrdConnectKit({
  hideConnectButton,
  onViewProfile,
  renderAvatar,
}: OrdConnectKitProp) {
  const { address, network, isModalOpen, openModal, closeModal } =
    useOrdConnect();

  const renderConnectButton = () => {
    if (hideConnectButton) {
      return null;
    }

    return address?.ordinals ? (
      <PostConnectButton
        address={address.ordinals}
        network={network}
        onViewProfile={onViewProfile}
        onChangeWallet={openModal}
        renderAvatar={renderAvatar}
      />
    ) : (
      <PreConnectButton openModal={openModal} />
    );
  };

  return (
    <>
      {renderConnectButton()}
      <SelectWalletModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        renderAvatar={renderAvatar}
      />
    </>
  );
}
