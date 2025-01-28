const ethers = require("ethers")
const optimism = require("@eth-optimism/sdk")
require('dotenv').config();

// npx hardhat run scripts/optimism/2.bridgeWstonToOptimism.js --network l1

const l1PrivateKey = process.env.PRIVATE_KEY;
const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1_RPC_URL);
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2_RPC_URL);
const l1Wallet = new ethers.Wallet(l1PrivateKey, l1Provider);
const l2Wallet = new ethers.Wallet(l1PrivateKey, l2Provider);

const l1Token = process.env.L1_WRAPPED_STAKED_TON_PROXY;
const l2Token = process.env.OP_SEPOLIA_WSTON_ADDRESS;

const erc20ABI = [
    { constant: true, inputs: [{ name: "_owner", type: "address" }], name: "balanceOf", outputs: [{ name: "balance", type: "uint256" }], type: "function" },
    { inputs: [], name: "faucet", outputs: [], stateMutability: "nonpayable", type: "function" }
];

const l1ERC20 = new ethers.Contract(l1Token, erc20ABI, l1Wallet);
const l2ERC20 = new ethers.Contract(l2Token, erc20ABI, l2Wallet);

const amount = 10000000000000000000000000000n;

const main = async () => {

    // Check L1 WSTON balance
    console.log((await l1ERC20.balanceOf(l1Wallet.address)).toString());

    const messenger = new optimism.CrossChainMessenger({
        l1ChainId: process.env.L1_CHAINID, // 11155111 for Sepolia, 1 for Ethereum
        l2ChainId: process.env.L2_CHAINID, // 11155420 for OP Sepolia, 10 for OP Mainnet
        l1SignerOrProvider: l1Wallet,
        l2SignerOrProvider: l2Wallet,
    });
    
    const approveTx = await messenger.approveERC20(l1Token, l2Token, amount);
    await approveTx.wait();

    const depositTx = await messenger.depositERC20(l1Token, l2Token, amount);
    await depositTx.wait();

    await messenger.waitForMessageStatus(depositTx.hash, optimism.MessageStatus.RELAYED);

    // Check L1 WSTON balance
    console.log((await l1ERC20.balanceOf(l1Wallet.address)).toString());

    // Check L2 WSTON balance
    console.log((await l2ERC20.balanceOf(l2Wallet.address)).toString());
};

main().then(() => process.exit(0)).catch((error) => {
    console.error('Error in main:', error);
    process.exit(1);
});
