import { Fragment, ReactNode } from "react";
import Avatar from "boring-avatars";
import { Menu, Transition } from "@headlessui/react";

import ChevronDownIcon from "../../assets/chevron-down.svg";
import LeatherWalletIcon from "../../assets/leather-wallet.svg";
import LogoutIcon from "../../assets/logout.svg";
import MagicEdenIcon from "../../assets/magiceden-wallet.svg";
import OKXWalletIcon from "../../assets/okx-wallet.svg";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";
import { useOrdConnect, Wallet } from "../../providers/OrdConnectProvider";
import { truncateMiddle } from "../../utils/text-helper";

const WALLET_TO_ICON: Record<Wallet, string> = {
  [Wallet.MAGICEDEN]: MagicEdenIcon,
  [Wallet.UNISAT]: UnisatWalletIcon,
  [Wallet.XVERSE]: XverseWalletIcon,
  [Wallet.LEATHER]: LeatherWalletIcon,
  [Wallet.OKX]: OKXWalletIcon,
} as const;

interface PostConnectButtonProp {
  address: string;
  network: string;
  onViewProfile?: () => void;
  onChangeWallet?: () => void;
  onDisconnectWallet?: () => void;
  renderAvatar?: (address: string, size: "large" | "small") => ReactNode;
}

export function PostConnectButton({
  address,
  network,
  onViewProfile,
  onChangeWallet,
  onDisconnectWallet,
  renderAvatar,
}: PostConnectButtonProp) {
  const { wallet } = useOrdConnect();

  const getNetworkDisplayName = () => {
    switch (network) {
      case "mainnet":
        return "Mainnet";
      case "testnet":
        return "Testnet";
      case "signet":
        return "Signet";
      default:
        return network;
    }
  };

  return (
    <Menu
      as="section"
      className="ord-connect-font ord-wallet-connected-container relative inline-block text-left"
    >
      {({ open }) => (
        <>
          <Menu.Button className="ord-wallet-connected-button">
            <div className="wallet-identifier-container">
              {renderAvatar ? (
                renderAvatar(address, "large")
              ) : (
                <Avatar
                  size={28}
                  variant="beam"
                  name={address}
                  colors={["#1C2DCB", "#F226B8"]}
                />
              )}
              <img
                src={WALLET_TO_ICON[wallet as Wallet]}
                alt={`${wallet} is connected`}
              />
            </div>

            <section className="address-container">
              <p className="address">{truncateMiddle(address)}</p>
              <section className="network-container">
                <div className="status-indicator" />
                <p className="network">{getNetworkDisplayName()}</p>
              </section>
            </section>
            <img
              src={ChevronDownIcon}
              className={`dropdown-button ${
                open ? "close-dropdown-button" : "expand-dropdown-button"
              }`}
              alt="ord connect dropdown"
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="ord-wallet-connection-dropdown">
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={() => onViewProfile?.()}
              >
                <span className="label">View profile</span>
                <span className="value">{truncateMiddle(address)}</span>
              </Menu.Item>
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={() => onChangeWallet?.()}
              >
                <span className="change-wallet-label">Change wallet</span>
              </Menu.Item>
              <hr className="horizontal-separator" />
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={() => onDisconnectWallet?.()}
              >
                <span className="label">Disconnect wallet</span>
                <img src={LogoutIcon} className="logout-icon" alt="logout" />
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
