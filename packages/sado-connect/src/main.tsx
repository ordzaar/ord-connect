import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import useSend from "./hooks/useSend";
import { SadoConnectKit } from "./index";
import { SadoConnectProvider } from "./providers/SadoContext";
import "./style.css";

function SampleComponent() {
  const [send, error] = useSend();
  const [result, setResult] = useState("");

  return (
    <div>
      <span>{result && `Transaction ID: ${result}`}</span>
      <span>{error && `Error: ${error}`}</span>
      <button
        onClick={async () => {
          const txId = await send(
            "tb1qzxtxwhsqkh0yp6ne0mpefu99gn49a945m9hc28",
            1
          );
          if (typeof txId === "string") setResult(txId);
        }}
      >
        Send money
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SadoConnectProvider>
      <SampleComponent />
      <SadoConnectKit />
    </SadoConnectProvider>
  </React.StrictMode>
);
