import { TruncateMiddle } from "../../utils/text-helper";
import ChevronDownIcon from "../../assets/chevron-down.svg";
import Avatar from "boring-avatars";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import LogoutIcon from "../../assets/logout.svg";
import { useAddressContext } from "../../providers/AddressContext";

interface PostConnectButtonProp {
  address: string;
  network: string;
}

export function PostConnectButton({ address, network }: PostConnectButtonProp) {
  const { updateAddress } = useAddressContext();
  const onDisconnectWallet = () => {
    updateAddress(null);
  };

  return (
    <>
      <div className="fixed top-16 w-56 text-right">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="sado-wallet-connected-button">
              <Avatar
                size={28}
                variant="beam"
                name={address}
                colors={["#1C2DCB", "#F226B8"]}
              />

              <div className="address-container">
                <p className="address">{TruncateMiddle(address)}</p>
                <div className="network-container">
                  <div className="status-indicator"></div>
                  <p className="network">{network}</p>
                </div>
              </div>
              <img src={ChevronDownIcon} className="expand-dropdown-button" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="sado-wallet-connection-dropdown absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item as="button" className="dropdown-button">
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
        </Menu>
      </div>
    </>
  );
}
