import { useState } from "react";
import "./style.css";
import { useSadoContext } from "../providers/SadoContext";
import { PreConnectButton } from "./PreConnectButton";
import { PostConnectButton } from "./PostConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

export interface SadoConnectKitProp {
  customLabel?: string;
  customStyle?: string;
  onViewWallet?: () => void;
}

/**
 * Parent React component for SadoConnectKit, in the form of a button.
 *
 * @component
 * @param {Object} props - Props for the SadoConnectKit component.
 * @param {string} [props.customLabel="Connect wallet"] - Custom label for the button.
 * @param {string} [props.customStyle] - Custom CSS style for the button.
 * @param {Function} [props.onViewWallet] - Callback function to handle viewing wallet.
 * @returns {JSX.Element} SadoConnectKit React component.
 */
export function SadoConnectKit({
  customStyle,
  customLabel = "Connect wallet",
  onViewWallet,
}: SadoConnectKitProp) {
  const [isOpen, setIsOpen] = useState(false);
  const { address, network } = useSadoContext();

  function closeModal() {
    setIsOpen(false);
  }

  async function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      {address === null ? (
        <PreConnectButton
          openModal={openModal}
          customStyle={customStyle}
          customLabel={customLabel}
        />
      ) : (
        <PostConnectButton
          address={address}
          network={network}
          onViewWallet={onViewWallet}
        />
      )}

      <SelectWalletModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
