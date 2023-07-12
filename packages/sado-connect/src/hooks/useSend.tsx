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

  const format = deriveAddressFormat(address, network);

  const orditWallet = new Ordit({
    // Ordit must be initialized with a wallet, no matter what
    bip39:
      "bunker coyote fatal canvas critic despair morning region book method phrase decide",
    network,
  });

  const send: SendFunction = async (toAddress, satoshis) => {
    const unsignedPsbtBase64 = (
      await ordit.transactions.createPsbt({
        // Use master node by default (BIP32 HD Wallet)
        path: "/m",
        format,
        network,
        pubKey: publicKey,
        ins: [
          {
            address,
          },
        ],
        outs: [
          {
            address: toAddress,
            cardinals: satoshis,
          },
        ],
      })
    ).base64;

    const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);

    if (wallet === Wallet.UNISAT) {
      try {
        // ordit-sdk outputs serialized psbt(s) in the form of base64/hex,
        // but expects psbt objects as an input.
        // Hence, the need to deserialize and serialize for back-and-forth actions.
        const signedPsbt = (await ordit.unisat.signPsbt(unsignedPsbt)).psbt;

        const txId = await orditWallet.relayTx(signedPsbt.hex, network);

        return txId.txid[0];
      } catch (err: any) {
        setError(err.message);
      }
    } else if (wallet === Wallet.XVERSE) {
      try {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          // Is this optional? The input should already exist in the unsigned psbt
          inputs: [{ address, signingIndexes: [0] }],
        };
        const signedPsbt = await ordit.xverse.signPsbt(xverseSignPsbtOptions);

        if (signedPsbt) {
          const txId = await orditWallet.relayTx(signedPsbt, network);
          return txId.txid[0];
        }

        throw new Error("Xverse signing failed.");
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setError("No wallet selected");
    }
    return null;
  };

  return [send, error];
}

export default useSend;
