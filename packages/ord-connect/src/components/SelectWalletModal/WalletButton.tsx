import { useState } from "react";
import ChevronRightIcon from "../../assets/chevron-right.svg";
import LoadingIcon from "../../assets/loading.svg";

interface WalletButtonProp {
  name: string;
  onConnect: () => Promise<boolean>;
  icon: string;
  setErrorMessage: (msg: string) => void;
}

export function WalletButton({
  name,
  onConnect,
  icon,
  setErrorMessage,
}: WalletButtonProp) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      className="wallet-option-button"
      onClick={async () => {
        setLoading(true);
        const timeout = (resolve) => setTimeout(() => resolve("timeout"), 5000);
        const success = await Promise.race([onConnect(), new Promise(timeout)]);
        if (success === "timeout") {
          setErrorMessage(
            "No wallet pop-up? The extension is not responding. Try reloading your browser.",
          );
        } else {
          setLoading(false);
        }
      }}
    >
      <img width={40} src={icon} alt={`Connect ${name} Wallet`} />
      <span className="wallet-option-label">{name}</span>
      {loading ? (
        <img
          src={LoadingIcon}
          width={40}
          alt={`${name} wallet extension is loading`}
        />
      ) : (
        <img src={ChevronRightIcon} alt="Chevron Right" />
      )}
    </button>
  );
}
