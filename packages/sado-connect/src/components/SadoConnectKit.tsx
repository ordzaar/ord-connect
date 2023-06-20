import { useEffect, useState } from "react";
import "./style.css";
import { useAddressContext } from "../providers/AddressContext";
import { PreConnectButton } from "./PreConnectButton";
import { PostConnectButton } from "./PostConnectButton";
import { SelectWalletModal } from "./SelectWalletModal";

export interface SadoConnectKitProp {
  customLabel?: string;
  customStyle?: string;
}

export function SadoConnectKit({
  customStyle,
  customLabel = "Connect wallet",
}: SadoConnectKitProp) {
  const { address } = useAddressContext();
  const network = "MainNet";
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
    // const wallet = await (window as any).ordit.sdk.get("wallet", {
    //   seed: "msmalley",
    // });
  }

  return (
    <>
      {address === null ? (
        <PreConnectButton
          openModal={openModal}
          customStyle={customStyle}
          customLabel={customLabel}
        />
      ) : (
        <PostConnectButton
          openModal={openModal}
          address={address}
          network={network}
        />
      )}

      <SelectWalletModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
