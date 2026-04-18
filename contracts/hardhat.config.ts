import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";

const networks: any = {
  localhost: {
    type: "http",
    chainType: "l1",
    url: "http://127.0.0.1:8545",
  },
  hardhatMainnet: {
    type: "edr-simulated",
    chainType: "l1",
  },
  hardhatOp: {
    type: "edr-simulated",
    chainType: "op",
  },
};

if (process.env.SEPOLIA_RPC_URL) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    url: process.env.SEPOLIA_RPC_URL,
    accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
  };
}

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks,
});