import { createContext, useContext, useState } from "react";

interface SadoContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
}

const SadoContext = createContext<SadoContextI>(undefined as any);

export function SadoConnectProvider({
  children,
}: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<string | null>(null);

  const context: SadoContextI = {
    address,
    updateAddress: (address) => setAddress(address),
  };

  return (
    <SadoContext.Provider value={context}>{children}</SadoContext.Provider>
  );
}
export function useSadoContext() {
  return useContext(SadoContext);
}
