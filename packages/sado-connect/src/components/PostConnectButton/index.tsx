import { TruncateMiddle } from "../../utils/text-helper";
import ChevronDownIcon from "../../assets/chevron-down.svg";
import Avatar from "boring-avatars";

interface PostConnectButtonProp {
  openModal: () => void;
  address: string;
  network: string;
}

export function PostConnectButton({
  openModal,
  address,
  network,
}: PostConnectButtonProp) {
  return (
    <button
      type="button"
      onClick={openModal}
      className="sado-wallet-detail-button"
    >
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
    </button>
  );
}
