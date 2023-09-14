import "./style.css";
import { useOrdContext } from "../providers/OrdContext.tsx";
import { PreConnectButton } from "./PreConnectButton";
import { PostConnectButton } from "./PostConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

export interface OrdConnectKitProp {
  customStyle?: string;
  onViewWallet?: () => void;
}

/**
 * Parent React component for OrdConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the OrdConnectKit component.
 * @param {string} [props.customStyle] - Custom CSS style for the button.
 * @param {Function} [props.onViewWallet] - Callback function to handle viewing wallet.
 * @returns {JSX.Element} OrdConnectKit React component.
 */
export function OrdConnectKit({
  customStyle,
  onViewWallet,
}: OrdConnectKitProp) {
  const { address, network, isModalOpen, openModal, closeModal } =
    useOrdContext();

  return (
    <>
      {address?.ordinals ? (
        <PostConnectButton
          address={address.ordinals}
          network={network}
          onViewWallet={onViewWallet}
        />
      ) : (
        <PreConnectButton openModal={openModal} customStyle={customStyle} />
      )}

      <SelectWalletModal isOpen={isModalOpen} closeModal={closeModal} />
    </>
  );
}
