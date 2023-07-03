import { useState } from "react";
import "./style.css";
import { useSadoContext } from "../providers/SadoContext";
import { PreConnectButton } from "./PreConnectButton";
import { PostConnectButton } from "./PostConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

export interface SadoConnectKitProp {
  customLabel?: string;
  customStyle?: string;
}

export function SadoConnectKit({
  customStyle,
  customLabel = "Connect wallet",
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
        <PostConnectButton address={address} network={network} />
      )}

      <SelectWalletModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
