import { SupportedWallets } from "../types/OrditSdk";

export async function send(fromWallet: SupportedWallets, toAddress: string) {
  await (window as any).ordit.sdk.psbt.get(
    {
      connect: fromWallet,
      ins: [
        {
          address: "any",
        },
      ],
      outs: [
        {
          address: toAddress,
          // cardinals: 1000, // can also be either satoshis or location
          satoshis: 1,
        },
      ],
    },
    function (r: any) {
      console.log(r);
    }
  );
}
