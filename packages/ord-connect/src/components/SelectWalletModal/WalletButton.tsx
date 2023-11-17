import { useCallback, useState } from "react";

import ChevronRightIcon from "../../assets/chevron-right.svg";
import LoadingIcon from "../../assets/loading.svg";

interface WalletButtonProp {
  name: string;
  info: string;
  onConnect: () => Promise<boolean>;
  icon: string;
  setErrorMessage: (msg: string) => void;
  isDisabled?: boolean;
  isMobileDevice?: boolean;
}

export function WalletButton({
  name,
  info,
  onConnect,
  icon,
  setErrorMessage,
  isDisabled,
  isMobileDevice,
}: WalletButtonProp) {
  const [loading, setLoading] = useState(false);

  const handleWalletConnectClick = useCallback(async () => {
    setLoading(true);
    const result = await Promise.race([
      onConnect()
        .then(() => setLoading(false))
        .catch(() => setLoading(false)),
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("timeout"), 5000);
      }),
    ]);
    if (result === "timeout") {
      setErrorMessage(
        "No wallet pop-up? The extension is not responding. Try reloading your browser.",
      );
    } else {
      setLoading(false);
    }
  }, [onConnect, setErrorMessage]);

  return (
    <button
      type="button"
      className="wallet-option-button"
      onClick={handleWalletConnectClick}
      disabled={isDisabled}
    >
      <div className="option-wrapper">
        <img
          className="wallet-icon"
          src={icon}
          alt={`Connect ${name} Wallet`}
        />
        <div className="wallet-option">
          <span className="wallet-option-label">{name}</span>
          <span
            className="wallet-option-info"
            style={{ display: isMobileDevice ? "block" : "none" }}
          >
            {info}
          </span>
        </div>
        {loading ? (
          <img
            src={LoadingIcon}
            width={30}
            alt={`${name} wallet extension is loading`}
          />
        ) : (
          <img
            src={ChevronRightIcon}
            alt="Chevron Right"
            width={20}
            height={20}
            className="chveron-btn"
          />
        )}
      </div>
    </button>
  );
}
