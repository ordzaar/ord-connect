import React from "react";
import ReactDOM from "react-dom/client";
import { SadoConnectKit } from "./index.ts";
import { AddressProvider } from "./providers/AddressContext.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AddressProvider>
      <SadoConnectKit />
    </AddressProvider>
  </React.StrictMode>
);
