import "./App.css";
import { AddressProvider, SadoConnectKit } from "sado-connect";
import "../node_modules/sado-connect/dist/style.css";

function App() {
  return (
    <AddressProvider>
      <SadoConnectKit />
    </AddressProvider>
  );
}

export default App;
