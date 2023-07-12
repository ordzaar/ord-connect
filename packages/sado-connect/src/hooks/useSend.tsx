import { useState } from "react";
import { Network, useSadoContext, Wallet } from "../providers/SadoContext";
import { addressFormats, Ordit, ordit } from "@sadoprotocol/ordit-sdk";
import { Psbt } from "bitcoinjs-lib";

type SendFunction = (
  address: string,
  satoshis: number
) => Promise<string | null>;

function deriveAddressFormat(address: string, network: Network) {
  if (!address) return null;

  const addressFormatPairs = Object.entries(addressFormats[network]);

  let format = null;
  addressFormatPairs.find(([key, regex]) => {
    if (address.match(regex)) {
      format = key;
      return true;
    }
  });

  return format;
}
function useSend(): [SendFunction, string | null] {
  const { wallet, network, address, publicKey } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const orditWallet = new Ordit({
    // Ordit must be initialized with a wallet, no matter what
    bip39: "abandon",
    network,
  });

  const send: SendFunction = async (toAddress, satoshis) => {
    try {
      if (!address || !publicKey) throw new Error("No wallet is connected");

      // const psbtTemplate = {
      //   // Use master node by default (BIP32 HD Wallet)
      //   path: "/m",
      //   format: deriveAddressFormat(address, network),
      //   network,
      //   pubKey: publicKey,
      //   ins: [
      //     {
      //       address,
      //     },
      //   ],
      //   outs: [
      //     {
      //       address: toAddress,
      //       cardinals: satoshis,
      //     },
      //   ],
      // };

      // const unsignedPsbtBase64 = (
      //   await ordit.transactions.createPsbt(psbtTemplate)
      // ).base64;

      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);

      let signedPsbt = null;
      if (wallet === Wallet.UNISAT) {
        // ordit-sdk outputs serialized psbt(s) in the form of base64/hex,
        // but expects psbt objects as an input.
        // Hence, the need to deserialize and serialize for back-and-forth actions.
        signedPsbt = (await ordit.unisat.signPsbt(unsignedPsbt)).psbt;
      } else if (wallet === Wallet.XVERSE) {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          // Is this optional? The input should already exist in the unsigned psbt

          inputs: [],
        };
        signedPsbt = await ordit.xverse.signPsbt(xverseSignPsbtOptions);

        if (!signedPsbt) {
          throw new Error("Xverse signing failed.");
        }
      } else {
        throw new Error("No wallet selected");
      }

      const txId = await orditWallet.relayTx(signedPsbt.hex, network);
      return txId.txid[0];
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return [send, error];
}

export default useSend;
