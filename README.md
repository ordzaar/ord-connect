# ord-connect

<img src="preview.png" alt="Preview" width="605" height="350"/>

## Introduction

**ord-connect** is a React component library that allows you to easily integrate Bitcoin Ordinals & Inscriptions via [Sado Protocol Connections](https://sado.space) with your decentralized application (dApp). We currently support [Unisat](https://unisat.io) and [Xverse](https://www.xverse.app). We stand as the pioneering walletkit to support ordinal-aware transactions, ensuring you never inadvertently spend a rare ordinal!

## Wallet Feature Support

| Wallet | Ordinal-safety | Inscription-safety |
| ------ | -------------- | ------------------ |
| Unisat | ✅             | ✅                 |
| Xverse | ✅             | ✅                 |

## Quick Start

Just two simple steps:

1.  Add dependency:

    ```bash
    pnpm install @ordzaar/ord-connect
    ```

2.  Import ord-connect into your dApp:

    ```javascript
    import { OrdConnectProvider, OrdConnectKit } from "@ordzaar/ord-connect";

    export default function YourReactComponent() {
      return (
        <OrdConnectProvider initialNetwork={"testnet"} initialSafeMode={true}>
          <OrdConnectKit />
        </OrdConnectProvider>
      );
    }
    ```

## Contribute

The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need to have `pnpm` installed on your system. If it's not yet installed, you can get it via npm using:

```bash
npm install -g pnpm
```

### Development

To develop ord-connect, navigate to the ord-connect directory, install the necessary packages and serve the project:

```bash
cd packages/ord-connect
pnpm install
pnpm dev
```

The sample playground component is located at `packages/ord-connect/src/main.tsx`.

Changes made to the code will be reflected immediately.

## Local Integration Testing

For inter-repo local testing:

1. Link the global package to the local project:

   ```bash
   pnpm link packages/ord-connect --global
   ```

2. `cd` to any repo of your choosing (e.g., ordzaar).

3. The remaining steps are identical to [Quick Start](#quick-start).

Happy coding! For any issues or feature requests, please raise an issue in the GitHub repository.
