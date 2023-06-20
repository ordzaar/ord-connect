import { createContext, useContext, useState } from "react";

interface AddressContextI {
  address: string | null;
  updateAddress: (address: string | null) => void;
}

const AddressContext = createContext<AddressContextI>(undefined as any);

export function AddressProvider({ children }: React.PropsWithChildren<any>) {
  const [address, setAddress] = useState<string | null>(null);

  const context: AddressContextI = {
    address,
    updateAddress: (address) => setAddress(address),
  };

  return (
    <AddressContext.Provider value={context}>
      {children}
    </AddressContext.Provider>
  );
}
export function useAddressContext() {
  return useContext(AddressContext);
}
