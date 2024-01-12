import { useCallback, useState } from "react";

import { useBalance } from "./hooks/useBalance";
import { useSend } from "./hooks/useSend";
import { useSignMessage } from "./hooks/useSignMessage";
import {
  Network,
  OrdConnectProvider,
  useOrdConnect,
} from "./providers/OrdConnectProvider";
import { OrdConnectKit, useSign } from "./index";

import "./style.css";

function TestControls() {
  const { send, error: sendError, loading: isSending } = useSend();
  const {
    getBalance,
    error: balanceError,
    loading: isLoadingBalance,
  } = useBalance();
  const { sign, error: signPsbtError } = useSign();
  const { signMsg, error: signMessageError } = useSignMessage();
  const [result, setResult] = useState("");
  const [balance, setBalance] = useState<number | undefined>(undefined);

  const { address, wallet } = useOrdConnect();

  const handleCheckBalance = useCallback(async () => {
    const walletBalance = await getBalance();
    setBalance(walletBalance);
  }, [getBalance]);

  const handleSend = useCallback(async () => {
    const txId = await send(
      "tb1qgypdud5xr0x0wugf5yv62z03ytkwxusjwsr9kq",
      1000,
      10,
    );
    if (txId) {
      setResult(txId);
    }
  }, [send]);

  const handleSignPsbt = useCallback(async () => {
    if (!address.payments) {
      throw new Error("No payment address");
    }

    const signed = await sign(
      address.payments,
      "cHNidP8BAFICAAAAARXJoLPdXB0nA98DsK0PaC5ABbmJbxKPAZ+WUvKJYgieAAAAAAD/////AaRCDwAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIAAAAAAAEBH2QAAAAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIBAwSDAAAAAAA=",
      { extractTx: false },
    );
    console.log(signed);
  }, [address.payments, sign]);

  const handleSignMessage = useCallback(async () => {
    if (!address.ordinals) {
      throw new Error("No payment address");
    }

    const signed = await signMsg(
      address.ordinals,
      "Authenticate this message to access all the functionalities of Ordzaar. By using Ordzaar implies your consent to our user agreement.\n\nDomain: ordzaar.com\n\nBlockchain: Bitcoin \n\nAccount:\ntb1q82avu57rf0xe4wgrkudwa0ewrh7mfrsejkum3h\n\nNonce: 4NfCJ3FEDQ",
    );
    console.log(signed);
  }, [address.ordinals, signMsg]);

  return (
    <div className="controls">
      <div>
        <button type="button" onClick={handleCheckBalance}>
          Check balance
        </button>
        <button type="button" onClick={handleSend}>
          Send money
        </button>
        <button type="button" onClick={handleSignPsbt}>
          Sign PSBT
        </button>
        <button type="button" onClick={handleSignMessage}>
          Sign message
        </button>
      </div>
      <div>
        {wallet ? <p>Wallet: {wallet}</p> : null}
        {address?.ordinals ? (
          <p>Connected Address: {address.ordinals ?? ""}</p>
        ) : null}
        {typeof balance === "number" || isLoadingBalance ? (
          <p>
            Wallet Balance: {isLoadingBalance ? "Loading" : `${balance} sats`}
          </p>
        ) : null}
        {balanceError ? <p>Wallet Balance Error: {balanceError}</p> : null}
        {result ? <p>Transaction ID: {result}</p> : null}
        {signPsbtError ? <p>Sign Psbt Error: {signPsbtError}</p> : null}
        {signMessageError ? (
          <p>Sign Message Error: {signMessageError}</p>
        ) : null}
        {sendError ? <p>Send Error: {sendError}</p> : null}
        {isSending ? <p>Sending</p> : null}
      </div>
    </div>
  );
}

export function SampleApp() {
  return (
    <div className="app">
      <OrdConnectProvider initialNetwork={Network.TESTNET}>
        <OrdConnectKit
          onViewProfile={() => console.log("View profile clicked")}
          disableMobile={false}
        />
        <TestControls />
      </OrdConnectProvider>
    </div>
  );
}
