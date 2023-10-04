import { JsonRpcDatasource } from "@sadoprotocol/ordit-sdk";
import { Network } from "../providers/OrdContext";

interface JsonRpcDatasourceOptions {
  network: Network;
}

interface RelayOptions {
  hex: string;
  maxFeeRate?: number;
}

const apiConfig = {
  apis: {
    mainnet: {
      batter: "https://proto.ordit.io/",
    },
    regtest: {
      batter: "https://regtest-v2.ordit.io/",
    },
    testnet: {
      batter: "https://testnet-v2.ordit.io/",
    },
  },
};

// eslint-disable-next-line import/no-default-export
export default class CustomJsonRpcDatasource extends JsonRpcDatasource {
  private url: string;

  constructor({ network }: JsonRpcDatasourceOptions) {
    super({ network });
    this.url = apiConfig.apis[network].batter;
  }

  async fetch(method: string, params: any) {
    const response = await fetch(`${this.url}rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: "ordzaar",
      }),
    });
    if (response.status === 200) {
      const json = await response.json();
      if (json.error) {
        const error =
          typeof json.error.data === "string"
            ? json.error.data
            : json.error.message;
        throw new Error(error);
      }
      return json.result;
    }
    throw new Error(`Internal Server Error`);
  }

  override async relay({ hex, maxFeeRate }: RelayOptions) {
    if (this.network === "mainnet") {
      return super.relay({ hex, maxFeeRate });
    }
    if (!hex) {
      throw new Error("Invalid request");
    }

    // eslint-disable-next-line no-restricted-globals
    if (maxFeeRate && (maxFeeRate < 0 || isNaN(maxFeeRate))) {
      throw new Error("Invalid max fee rate");
    }

    return this.fetch("SendRawTransaction", { hex, maxFeeRate });
  }
}
