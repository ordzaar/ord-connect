# sado-connect

## Introduction

**sado-connect** is a React component library that allows you to easily integrate Bitcoin Ordinals & Inscriptions via [Sado Protocol Connections](https://sado.space) with your decentralized application (dApp). We currently support [Unisat](https://unisat.io) and [Xverse](https://www.xverse.app).

## Getting Started

The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need to have `pnpm` installed on your system. If it's not yet installed, you can get it via npm using:

```bash
npm install -g pnpm
```

### Installing

To compile sado-connect, navigate to the sado-connect directory, install the necessary packages and build the project:

```bash
cd packages/sado-connect
pnpm install
pnpm build
```

To continuously watch the sado-connect package and recompile on changes, use the `watch` command:

```bash
cd packages/sado-connect
pnpm install
pnpm watch
```

## Live Development Server

To observe live changes in the browser, first ensure that sado-connect has been compiled. Then navigate to the `examples/vite` directory, install the necessary packages, and start the development server:

```bash
cd examples/vite
pnpm install
pnpm dev
```

## Testing

For inter-repo local testing:

1. `cd` to any repo of your choosing (e.g., ordzaar).
2. Link the global package to the local project:

   ```bash
   pnpm link packages/sado-connect --global
   ```

3. Add sado-connect to your project:

   ```bash
   pnpm add sado-connect
   ```

4. Import sado-connect in your code as follows:

   ```javascript
   import SadoConnect from "sado-connect";
   ```

Happy coding! For any issues or feature requests, please raise an issue in the GitHub repository.
