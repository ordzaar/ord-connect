import { ReactNode, useState } from "react";
import Avatar from "boring-avatars";

import ChevronRightIcon from "../../assets/chevron-right.svg";
import LoadingIcon from "../../assets/loading.svg";
import { useOrdConnect, Wallet } from "../../providers/OrdConnectProvider";
import { isMobileUserAgent } from "../../utils/mobile-detector";
import { truncateMiddle } from "../../utils/text-helper";

const WALLET_TO_NAME: Record<Wallet, string> = {
  [Wallet.MAGICEDEN]: "Magic Eden",
  [Wallet.UNISAT]: "UniSat",
  [Wallet.XVERSE]: "Xverse",
  [Wallet.LEATHER]: "Leather",
  [Wallet.OKX]: "OKX",
} as const;

export interface WalletButtonProps {
  wallet: Wallet;
  subtitle: string;
  onConnect: () => Promise<boolean>;
  icon: string;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
  isPreferred?: boolean;
}

export function WalletButton({
  wallet,
  subtitle,
  onConnect,
  icon,
  renderAvatar,
  isPreferred,
}: WalletButtonProps) {
  const isMobile = isMobileUserAgent();
  const { wallet: connectedWallet, address: connectedAddress } =
    useOrdConnect();

  const [loading, setLoading] = useState(false);
  const walletName = WALLET_TO_NAME[wallet];

  const handleWalletConnectClick = async () => {
    setLoading(true);
    try {
      await onConnect();
    } catch (e) {
      // intentionally empty
    }
    setLoading(false);
  };

  const hasConnectedWallet =
    connectedWallet === wallet && connectedAddress.ordinals;

  return (
    <button
      type="button"
      className="wallet-option-button"
      onClick={handleWalletConnectClick}
    >
      <div className="option-wrapper">
        <img className="wallet-icon" src={icon} alt="" />
        <div className="wallet-option">
          <span className="wallet-option-label">{walletName}</span>
          <span
            className="wallet-option-subtitle"
            style={{ display: isMobile ? "block" : "none" }}
          >
            {subtitle}
          </span>
        </div>
        {connectedWallet === wallet && connectedAddress.ordinals ? (
          <div className="wallet-option-connected-address">
            {renderAvatar ? (
              renderAvatar(connectedAddress.ordinals, "small")
            ) : (
              <Avatar
                size={16}
                variant="beam"
                name={connectedAddress.ordinals}
                colors={["#1C2DCB", "#F226B8"]}
              />
            )}
            <span className="label">
              {truncateMiddle(connectedAddress.ordinals)}
            </span>
          </div>
        ) : null}

        {!hasConnectedWallet && isPreferred ? (
          <span className="preferred-label">Preferred</span>
        ) : null}

        {loading ? (
          <img
            src={LoadingIcon}
            width={24}
            height={24}
            alt={`${walletName} extension is loading`}
          />
        ) : (
          <img
            src={ChevronRightIcon}
            alt=""
            width={24}
            height={24}
            className="chevron-btn"
          />
        )}
      </div>
    </button>
  );
}
