require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    l2: {
      url: process.env.L2_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: parseInt(process.env.L2_CHAINID, 10),
    },
    l1: {
      url: process.env.L1_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    }
  },
  etherscan: {
    apiKey: {
      l1: process.env.ETHERSCAN_API_KEY,
      l2: process.env.L2_EXPLORER_API_URL,
      bscTestnet: "abcd",
    },
    customChains: [
      {
        network: "l2",
        chainId: parseInt(process.env.L2_CHAINID, 10),
        urls: {
          apiURL: process.env.L2_EXPLORER_API_URL,
          browserURL: process.env.L2_EXPLORER_URL,
        },
      }
    ]
  }
};
