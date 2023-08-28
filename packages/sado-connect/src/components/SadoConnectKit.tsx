import "./style.css";
import { useSadoContext } from "../providers/SadoContext";
import { PreConnectButton } from "./PreConnectButton";
import { PostConnectButton } from "./PostConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

export interface SadoConnectKitProp {
  customStyle?: string;
  onViewWallet?: () => void;
}

/**
 * Parent React component for SadoConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the SadoConnectKit component.
 * @param {string} [props.customStyle] - Custom CSS style for the button.
 * @param {Function} [props.onViewWallet] - Callback function to handle viewing wallet.
 * @returns {JSX.Element} SadoConnectKit React component.
 */
export function SadoConnectKit({
  customStyle,
  onViewWallet,
}: SadoConnectKitProp) {
  const { address, network, isModalOpen, openModal, closeModal } =
    useSadoContext();

  return (
    <>
      {address === null ? (
        <PreConnectButton openModal={openModal} customStyle={customStyle} />
      ) : (
        <PostConnectButton
          address={address}
          network={network}
          onViewWallet={onViewWallet}
        />
      )}

      <SelectWalletModal isOpen={isModalOpen} closeModal={closeModal} />
    </>
  );
}
