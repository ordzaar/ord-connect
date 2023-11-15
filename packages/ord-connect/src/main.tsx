import React from "react";
import ReactDOM from "react-dom/client";

import { SampleApp } from "./SampleApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SampleApp />
  </React.StrictMode>,
);
