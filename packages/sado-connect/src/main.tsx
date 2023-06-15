import React from "react";
import ReactDOM from "react-dom/client";
import { ConnectKit } from "./index.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConnectKit />
  </React.StrictMode>
);
