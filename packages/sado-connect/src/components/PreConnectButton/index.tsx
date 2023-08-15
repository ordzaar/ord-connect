import { SadoConnectKitProp } from "../SadoConnectKit";

interface PreConnectButtonProp extends SadoConnectKitProp {
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
      className={`sado-connect-wallet-button ${customStyle}`}
    >
      <span></span>
    </button>
  );
}
