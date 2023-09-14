import Avatar from "boring-avatars";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ChevronDownIcon from "../../assets/chevron-down.svg";
import { TruncateMiddle } from "../../utils/text-helper";
import LogoutIcon from "../../assets/logout.svg";
import { Wallet, useOrdContext } from "../../providers/OrdContext.tsx";
import UnisatWalletIcon from "../../assets/unisat-wallet.svg";
import XverseWalletIcon from "../../assets/xverse-wallet.svg";

interface PostConnectButtonProp {
  address: string;
  network: string;
  onViewWallet?: () => void;
}

export function PostConnectButton({
  address,
  network,
  onViewWallet,
}: PostConnectButtonProp) {
  const { disconnectWallet, wallet } = useOrdContext();

  return (
    <Menu
      as="section"
      className="ord-wallet-connected-container relative inline-block text-left"
    >
      {({ open }) => (
        <>
          <Menu.Button className="ord-wallet-connected-button">
            <div className="wallet-identifier-container">
              <Avatar
                size={28}
                variant="beam"
                name={address}
                colors={["#1C2DCB", "#F226B8"]}
              />
              <img
                src={
                  wallet === Wallet.XVERSE ? XverseWalletIcon : UnisatWalletIcon
                }
                alt={`${wallet} is connected`}
              />
            </div>

            <section className="address-container">
              <p className="address">{TruncateMiddle(address)}</p>
              <section className="network-container">
                <div className="status-indicator" />
                <p className="network">
                  {network === "mainnet" ? "MainNet" : "TestNet"}
                </p>
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
                onClick={onViewWallet}
              >
                <span className="label">View wallet</span>
                <span className="value">{TruncateMiddle(address)}</span>
              </Menu.Item>
              <hr className="horizontal-separator" />
              {/* <Menu.Item as="button" className="dropdown-button"> */}
              {/*  <span className="label">Offers</span> */}
              {/*  <div className="offers">0</div> */}
              {/* </Menu.Item> */}
              {/* <hr className="horizontal-separator" /> */}
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={disconnectWallet}
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
