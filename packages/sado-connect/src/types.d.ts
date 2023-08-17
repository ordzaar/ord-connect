type Unisat = {
  addListener: (eventName: string, callback: (arg: string) => void) => void;
  removeListener: (eventName: string, callback: (arg: string) => void) => void;
  getNetwork: () => Promise<UnisatNetwork>;
  switchNetwork: (targetNetwork: UnisatNetwork) => Promise<void>;
  requestAccounts: () => Promise<string[]>;
  getPublicKey: () => Promise<string>;
  signPsbt: (hex: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  sendBitcoin: (
    address: string,
    satoshis: number,
    options: { feeRate?: number },
  ) => Promise<string>;
  getBalance: () => Promise<{
    confirmed: number;
    total: number;
    unconfirmed: number;
  }>;
};

declare interface Window {
  chrome: {
    app: {
      isInstalled: boolean;
      InstallState: {
        DISABLED: "disabled";
        INSTALLED: "installed";
        NOT_INSTALLED: "not_installed";
      };
      RunningState: {
        CANNOT_RUN: "cannot_run";
        READY_TO_RUN: "ready_to_run";
        RUNNING: "running";
      };
    };
  };
  unisat: Unisat;
  satsConnect: any;
}
