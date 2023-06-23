import "./App.css";
import {
  AddressProvider,
  SadoConnectKit,
  SupportedWallets,
  send,
} from "sado-connect";
import "../node_modules/sado-connect/dist/style.css";

function App() {
  const onSend = (wallet: SupportedWallets) => {
    send(wallet, "2MzQHEpGYFkzZYgcr4NtqbDuGGnkkSTdHWx");
  };

  return (
    <AddressProvider>
      <SadoConnectKit />
      <button type="button" onClick={() => onSend(SupportedWallets.Unisat)}>
        Send 1 sat from Unisat
      </button>
      <button type="button" onClick={() => onSend(SupportedWallets.Xverse)}>
        Send 1 sat from Xverse
      </button>
    </AddressProvider>
  );
}

export default App;
