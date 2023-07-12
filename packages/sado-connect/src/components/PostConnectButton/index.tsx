import { TruncateMiddle } from "../../utils/text-helper";
import ChevronDownIcon from "../../assets/chevron-down.svg";
import Avatar from "boring-avatars";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import LogoutIcon from "../../assets/logout.svg";
import { useSadoContext } from "../../providers/SadoContext";

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
  const { updateAddress, updateWallet, updatePublicKey } = useSadoContext();
  const onDisconnectWallet = () => {
    updateAddress(null);
    updateWallet(null);
    updatePublicKey(null);
  };

  return (
    <Menu
      as="section"
      className="sado-wallet-connected-container relative inline-block text-left"
    >
      {({ open }) => (
        <>
          <Menu.Button className="sado-wallet-connected-button">
            <Avatar
              size={28}
              variant="beam"
              name={address}
              colors={["#1C2DCB", "#F226B8"]}
            />

            <section className="address-container">
              <p className="address">{TruncateMiddle(address)}</p>
              <section className="network-container">
                <div className="status-indicator"></div>
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
            <Menu.Items className="sado-wallet-connection-dropdown">
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={onViewWallet}
              >
                <span className="label">View wallet</span>
                <span className="value">{TruncateMiddle(address)}</span>
              </Menu.Item>
              <hr className="horizontal-separator" />
              <Menu.Item as="button" className="dropdown-button">
                <span className="label">Offers</span>
                <div className="offers">0</div>
              </Menu.Item>
              <hr className="horizontal-separator" />
              <Menu.Item
                as="button"
                className="dropdown-button"
                onClick={onDisconnectWallet}
              >
                <span className="label">Disconnect wallet</span>
                <img src={LogoutIcon} className="logout-icon" />
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
