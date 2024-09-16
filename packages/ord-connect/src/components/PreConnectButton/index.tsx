import type { OrdConnectKitProps } from "../OrdConnectKit";

interface PreConnectButtonProps extends OrdConnectKitProps {
  openModal: () => void;
  disabled?: boolean;
}

export function PreConnectButton({
  openModal,
  disabled,
}: PreConnectButtonProps) {
  return (
    <button
      type="button"
      onClick={openModal}
      disabled={disabled}
      data-testid="connect-wallet-button"
      className="ord-connect-font ord-connect-wallet-button"
    >
      <span />
    </button>
  );
}
