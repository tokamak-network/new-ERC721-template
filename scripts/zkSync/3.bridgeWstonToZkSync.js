import { Provider, Wallet } from "zksync-ethers";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const L1_RPC_ENDPOINT = process.env.L1_RPC_URL;
const L2_RPC_ENDPOINT = process.env.L2_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.L1_WRAPPED_STAKED_TON_PROXY; // ERC20 token address
const AMOUNT = 10000000000000000000000000000n; // Amount of tokens to deposit
async function main() {
  const l1Provider = new ethers.providers.JsonRpcProvider(L1_RPC_ENDPOINT);
  const l2Provider = new Provider(L2_RPC_ENDPOINT);
  const wallet = new Wallet(PRIVATE_KEY, l2Provider, l1Provider);
  
  // Approve the token transfer to the bridge
  const erc20 = new ethers.Contract(TOKEN_ADDRESS, [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ], wallet);
  
  const bridgeAddresses = await l2Provider.getDefaultBridgeAddresses();
  const bridgeAddress = bridgeAddresses.erc20L1; // Ensure this is the correct field
  console.log(`Bridge Address: ${bridgeAddress}`);
  console.log(`Token Address: ${TOKEN_ADDRESS}`);
  console.log(`Amount: ${AMOUNT.toString()}`);
  
  const approveTx = await erc20.approve(bridgeAddress, AMOUNT);
  await approveTx.wait();
  console.log(`Approved ${AMOUNT.toString()} tokens for transfer to the bridge`);

  // Deposit the ERC20 token to L2
  const depositTx = await wallet.deposit({
    token: TOKEN_ADDRESS,
    to: wallet.address,
    amount: AMOUNT,
    approveERC20: false, // Already approved manually
  });

  const l1Receipt = await depositTx.waitL1();
  console.log(`L1 Deposit transaction hash: ${l1Receipt.transactionHash}`);

  const l2Receipt = await depositTx.waitL2();
  console.log(`L2 Deposit transaction hash: ${l2Receipt.transactionHash}`);
}

main()
  .then(() => console.log("Deposit completed successfully"))
  .catch((error) => {
    console.error(`Error: ${error}`);
    process.exitCode = 1;
  });
