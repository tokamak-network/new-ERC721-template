const { ethers } = require('ethers');

// ENSURE WSTON IS WHITELISTED IN POLYGON L2
// CHECK https://support.polygon.technology/support/solutions/articles/82000902454-how-can-we-bridge-assets-from-an-ethereum-layer-1-contract-to-zkevm-is-there-an-approval-process-for for more info

// Configuration
const privateKey = process.env.PRIVATE_KEY; // Your Ethereum wallet private key
const tokenContractAddress = process.env.L1_WRAPPED_STAKED_TON_PROXY; // ERC20 token contract address on Ethereum
const zkEVMBridgeAddress = process.env.POLYGON_BRIDGE_ADDRESS; // Polygon zkEVM Bridge Contract Address
const amount = ethers.utils.parseUnits('10', 27); // 10 WSTON 

// RPC URLs
const ethereumRpcUrl = process.env.L1_RPC_URL; // Ethereum RPC
const polygonZkEvmRpcUrl = process.env.L2_RPC_URL; // Polygon zkEVM RPC

// Debugging logs
console.log('Token Contract Address:', tokenContractAddress);
console.log('zkEVM Bridge Address:', zkEVMBridgeAddress);
console.log('Amount:', amount.toString());

// Wallet setup
const provider = new ethers.providers.JsonRpcProvider(ethereumRpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// ABI for the ERC20 token and zkEVM Bridge
const erc20Abi = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];
const zkEVMBridgeAbi = [
  'function bridgeAsset(uint32 destinationNetwork, address destinationAddress, uint256 amount, address token, bool forceUpdateGlobalExitRoot, bytes calldata permitData) external payable',
];

async function bridgeToken() {
  try {
    // Initialize contracts
    const erc20Token = new ethers.Contract(tokenContractAddress, erc20Abi, wallet);
    const zkEVMBridge = new ethers.Contract(zkEVMBridgeAddress, zkEVMBridgeAbi, wallet);

    // Step 1: Approve the zkEVM Bridge to spend tokens
    const approveTx = await erc20Token.approve(zkEVMBridgeAddress, amount);
    await approveTx.wait();
    console.log('Approval transaction hash:', approveTx.hash);

    // Step 2: Bridge the tokens to Polygon zkEVM
    const destinationNetwork = 22; // Polygon zkEVM network ID
    const destinationAddress = wallet.address; // Address to receive tokens on Polygon zkEVM
    const forceUpdateGlobalExitRoot = true; // Set to true if you want to force update the global exit root
    const permitData = '0x'; // Empty permit data (not used in this case)

    const bridgeTx = await zkEVMBridge.bridgeAsset(
      destinationNetwork,
      destinationAddress,
      amount,
      tokenContractAddress,
      forceUpdateGlobalExitRoot,
      permitData,
      { gasLimit: 500000 } // Adjust gas limit as needed
    );

    await bridgeTx.wait();
    console.log('Bridge transaction hash:', bridgeTx.hash);

    console.log('Token bridged successfully to Polygon zkEVM!');
  } catch (error) {
    console.error('Error bridging token:', error);
  }
}

bridgeToken();