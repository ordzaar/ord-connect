import { useEffect, useState } from "react";
import "./style.css";
import { SelectWalletModal } from "./SelectWalletModal";

export interface ConnectKitProp {
  customLabel?: string;
  customStyle?: string;
}

export const SadoConnectKit = ({
  customStyle,
  customLabel = "Connect wallet",
}: ConnectKitProp) => {
  const [address, setAddress] = useState<string | undefined>();
  useEffect(() => {
    const scriptUrls = [
      "ecc.js",
      "bip32.js",
      "bip39.js",
      "buffer.js",
      "bitcoin-tap.js",
      "ordit-sdk.js",
    ];
    const scripts: HTMLScriptElement[] = [];

    scriptUrls.forEach((url) => {
      const script = document.createElement("script");
      script.src = `/ordit/${url}`;
      script.async = true;

      document.body.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach((script) => {
        document.body.removeChild(script);
      });
    };
  }, []);

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  async function openModal() {
    setIsOpen(true);
    const wallet = await (window as any).ordit.sdk.get("wallet", {
      seed: "msmalley",
    });
    console.log(wallet);
    setAddress(JSON.stringify(wallet.addresses));
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`sado-connect-wallet-button ${customStyle}`}
      >
        {/* // TODO update ui of button to display address */}
        {address ?? customLabel}
      </button>
      <SelectWalletModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
};
