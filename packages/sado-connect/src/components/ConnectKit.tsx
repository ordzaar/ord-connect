import "./style.css";

export interface ConnectKitProp {
  customLabel?: string;
  customStyle?: string;
}

export const ConnectKit = ({
  customStyle,
  customLabel = "Connect wallet",
}: ConnectKitProp) => {
  return (
    <button
      type="button"
      className={`sado-connect-wallet-button ${customStyle}`}
    >
      {customLabel}
    </button>
  );
};
