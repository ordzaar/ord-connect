import type { OrdConnectKitProp } from "../OrdConnectKit";

interface PreConnectButtonProp extends OrdConnectKitProp {
  openModal: () => void;
  disabled?: boolean;
}

export function PreConnectButton({
  openModal,
  disabled,
}: PreConnectButtonProp) {
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
