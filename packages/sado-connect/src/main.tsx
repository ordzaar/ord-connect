import React from "react";
import ReactDOM from "react-dom/client";
import { SadoConnectKit } from "./index.ts";
import { SadoConnectProvider } from "./providers/SadoContext.tsx";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SadoConnectProvider>
      <SadoConnectKit />
    </SadoConnectProvider>
  </React.StrictMode>
);
