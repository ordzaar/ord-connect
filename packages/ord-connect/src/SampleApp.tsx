import { useState } from "react";

import { useBalance } from "./hooks/useBalance";
import { useSend } from "./hooks/useSend";
import { useSignMessage } from "./hooks/useSignMessage";
import {
  Chain,
  Network,
  OrdConnectProvider,
  useOrdConnect,
  Wallet,
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

  const handleCheckBalance = async () => {
    try {
      const walletBalance = await getBalance();
      setBalance(walletBalance);
    } catch (err) {
      console.log("Failed to fetch balance", err);
      setBalance(undefined);
    }
  };

  const handleSend = async () => {
    const txId = await send(
      "tb1qgypdud5xr0x0wugf5yv62z03ytkwxusjwsr9kq",
      1000,
      10,
    );
    if (txId) {
      setResult(txId);
    }
  };

  const handleSignPsbt = async () => {
    if (!address.payments) {
      throw new Error("No payment address");
    }

    const signed = await sign(
      address.payments,
      "cHNidP8BAFICAAAAARXJoLPdXB0nA98DsK0PaC5ABbmJbxKPAZ+WUvKJYgieAAAAAAD/////AaRCDwAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIAAAAAAAEBH2QAAAAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIBAwSDAAAAAAA=",
      { extractTx: false },
    );
    console.log(signed);
  };

  const handleSignMessage = async () => {
    if (!address.ordinals) {
      throw new Error("No payment address");
    }

    const signed = await signMsg(
      address.ordinals,
      "This is a test message which will not be used anywhere.",
    );
    console.log(signed);
  };

  return (
    <div className="test-container">
      <div className="controls">
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
      <div className="details">
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
      <OrdConnectProvider network={Network.TESTNET} chain={Chain.BITCOIN}>
        <OrdConnectKit
          onViewProfile={() => console.log("View profile clicked")}
          preferredWallet={Wallet.UNISAT}
        />
        <TestControls />
      </OrdConnectProvider>
    </div>
  );
}
