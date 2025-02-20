const { ZkEvmClient, use } = require('@maticnetwork/maticjs')
const ethers = require("ethers")

// npx hardhat run scripts/polygon/2.bridgeWstonToPolygon.js --network l1
// WSTON TOKEN MUST BE WHITELISTED BEFORE

// Configuration
const config = {
  network: "testnet", // or "mainnet"
  version: "cardona", // or "v1" for mainnet
  parentProvider: process.env.L1_RPC_URL, // Ethereum RPC URL
  childProvider: process.env.L2_RPC_URL, // Polygon RPC URL
  parentDefaultOptions: { from: "0x5c5c36Bb1e3B266637F6830FCAe2Ee2715339Eb1" }, // Ethereum wallet address
  childDefaultOptions: { from: "0x5c5c36Bb1e3B266637F6830FCAe2Ee2715339Eb1" }, // Polygon wallet address
};

// Wallet setup
const privateKey = process.env.PRIVATE_KEY; // Private key of your wallet
const parentProvider = new ethers.providers.JsonRpcProvider(config.parentProvider);
const childProvider = new ethers.providers.JsonRpcProvider(config.childProvider);
const wallet = new ethers.Wallet(privateKey, parentProvider);

// ERC20 token details
const amount = 10000000000000000000000000000n; // 10 WSTON

const zkEvmClient = new ZkEvmClient();
zkEvmClient.init({
    network: config.network, 
    version: config.version, 
    parent: {
        provider: parentProvider,
        defaultConfig: {
        from: config.parentDefaultOptions
        }
    },
    child: {
        provider: childProvider,
        defaultConfig: {
        from: config.childDefaultOptions
        }
    }
});
const erc20Token = zkEvmClient.erc20(process.env.L1_WRAPPED_STAKED_TON_PROXY, true);
console.log("zkEvmClient initialized:", zkEvmClient);
console.log("ERC20 token object:", erc20Token);


async function bridgeERC20() {
  try {
    console.log("Starting ERC20 token bridge...");

    // approve 1000 amount
    const result1 = await erc20Token.approve(amount);

    const txHash1 = await result1.getTransactionHash();
    const receipt1 = await result1.getReceipt();
    console.log("ERC20 token approved for deposit:", txHash1);

    // Deposit ERC20 token to Polygon
    //deposit to user address
    const result2 = await erc20Token.deposit(amount, wallet.address);

    const txHash2 = await result2.getTransactionHash();
    const receipt2 = await result2.getReceipt();
    console.log("ERC20 token deposited to Polygon:", receipt2);

    console.log("Bridge process completed successfully!");
  } catch (error) {
    console.error("Error during bridging:", error);
  }
}

// Run the script
bridgeERC20();