import { ReactNode } from "react";

import useHasMounted from "../hooks/useHasMounted";
import { useOrdConnect, Wallet } from "../providers/OrdConnectProvider";

import { PostConnectButton } from "./PostConnectButton";
import { PreConnectButton } from "./PreConnectButton";
import { SelectWalletModal, WalletOrderType } from "./SelectWalletModal";

import "./style.css";

export interface OrdConnectKitProp {
  hideConnectButton?: boolean;
  onViewProfile?: () => void;
  onChangeWalletClick?: () => void;
  onDisconnectWalletClick?: () => void;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
  preferredWallet?: Wallet;
  walletsOrder?: WalletOrderType;
}

/**
 * Parent React component for OrdConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the OrdConnectKit component.
 * @param {boolean} [props.hideConnectButton] - Hides the connect and connected status button.
 * @param {Function} [props.renderAvatar] - Render prop for rendering wallet profile avatar when connected.
 * @param {Function} [props.onViewProfile] - Callback function to handle clicking view wallet profile.
 * @param {Function} [props.onChangeWalletClick] - Callback function to handle clicking change wallet.
 * @param {Function} [props.onDisconnectWalletClick] - Callback function to handle clicking disconnect wallet.
 * @param {Wallet} [props.preferredWallet] - Displays "Preferred" label beside desired wallet.
 * @param {WalletOrderType} [props.walletsOrder] - Customize wallets display order in select wallet pop up.
 * @returns {JSX.Element} OrdConnectKit React component.
 */
export function OrdConnectKit({
  hideConnectButton,
  onViewProfile,
  onChangeWalletClick,
  onDisconnectWalletClick,
  renderAvatar,
  preferredWallet,
  walletsOrder,
}: OrdConnectKitProp) {
  const {
    address,
    disconnectWallet,
    network,
    isModalOpen,
    openModal,
    closeModal,
  } = useOrdConnect();

  const hasMounted = useHasMounted();

  const renderConnectButton = () => {
    if (hideConnectButton) {
      return null;
    }

    return address?.ordinals ? (
      <PostConnectButton
        address={address.ordinals}
        network={network}
        onViewProfile={onViewProfile}
        onChangeWallet={() => {
          openModal();
          onChangeWalletClick?.();
        }}
        onDisconnectWallet={() => {
          disconnectWallet();
          onDisconnectWalletClick?.();
        }}
        renderAvatar={renderAvatar}
      />
    ) : (
      <PreConnectButton disabled={!hasMounted} openModal={openModal} />
    );
  };

  return (
    <>
      {renderConnectButton()}
      {hasMounted ? (
        <SelectWalletModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          renderAvatar={renderAvatar}
          preferredWallet={preferredWallet}
          walletsOrder={walletsOrder}
        />
      ) : null}
    </>
  );
}
