import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";
import {
  CreatePsbtOptions,
  getAddressType,
  ordit,
} from "@sadoprotocol/ordit-sdk";
import { Psbt } from "bitcoinjs-lib";

type SendFunction = (
  address: string,
  satoshis: number
) => Promise<string | null>;

// No choice but to typecast due to: https://github.com/sadoprotocol/ordit-sdk/issues/5
type SignedXversePsbt = {
  rawTxHex: string;
  psbt: {
    hex: string;
    base64: string;
  };
};

export function useSend(): [SendFunction, string | null] {
  const { wallet, network, address, publicKey } = useSadoContext();
  const [error, setError] = useState<string | null>(null);

  const send: SendFunction = async (toAddress, satoshis) => {
    try {
      setError(null);
      if (!address || !publicKey) throw new Error("No wallet is connected");

      const psbtTemplate: CreatePsbtOptions = {
        format: getAddressType(address, network),
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
      };

      // ordit-sdk outputs serialized psbt(s) in the form of base64/hex,
      // but expects psbt objects as an input.
      // Hence, the need to deserialize and serialize for back-and-forth actions.
      const unsignedPsbtBase64 = (
        await ordit.transactions.createPsbt(psbtTemplate)
      ).base64;
      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);
      let signedPsbt = null;
      if (wallet === Wallet.UNISAT) {
        const signedUnisatPsbt = await ordit.unisat.signPsbt(unsignedPsbt);
        signedPsbt = signedUnisatPsbt.rawTxHex;
      } else if (wallet === Wallet.XVERSE) {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          // Is this optional? The input should already exist in the unsigned psbt
          inputs: [],
        };
        const signedXversePsbt = await ordit.xverse.signPsbt(
          xverseSignPsbtOptions
        );
        signedPsbt = (signedXversePsbt as SignedXversePsbt).rawTxHex;

        if (!signedPsbt) {
          throw new Error("Xverse signing failed.");
        }
      } else {
        throw new Error("No wallet selected");
      }

      const txId = await ordit.transactions.relayTransaction(
        signedPsbt,
        network
      );
      return txId;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return [send, error];
}
