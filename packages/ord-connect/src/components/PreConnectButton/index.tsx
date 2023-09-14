import type { OrdConnectKitProp } from "../OrdConnectKit.tsx";

interface PreConnectButtonProp extends OrdConnectKitProp {
  openModal: () => void;
}

export function PreConnectButton({
  openModal,
  customStyle,
}: PreConnectButtonProp) {
  return (
    <button
      type="button"
      onClick={openModal}
      data-testid="connect-wallet-button"
      className={`ord-connect-wallet-button ${customStyle}`}
    >
      <span />
    </button>
  );
}
