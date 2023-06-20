import { SadoConnectKitProp } from "../SadoConnectKit";

interface PreConnectButtonProp extends SadoConnectKitProp {
  openModal: () => void;
}

export function PreConnectButton({
  openModal,
  customStyle,
  customLabel,
}: PreConnectButtonProp) {
  return (
    <button
      type="button"
      onClick={openModal}
      className={`sado-connect-wallet-button ${customStyle}`}
    >
      {customLabel}
    </button>
  );
}
