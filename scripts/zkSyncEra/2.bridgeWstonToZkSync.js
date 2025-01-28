import { Wallet, Provider, utils } from "zksync-ethers";
import * as ethers from "ethers";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// HTTP RPC endpoints
const L1_RPC_URL = process.env.L1_RPC_URL || ""; 
const L2_RPC_URL = process.env.L2_RPC_URL || "https://sepolia.era.zksync.dev";

// ERC-20 Token (DAI) address in L1
const TOKEN_ADDRESS = process.env.L1_WRAPPED_STAKED_TON_PROXY;

// Amount of tokens
const AMOUNT = "10";

const WALLET_PRIV_KEY = process.env.PRIVATE_KEY || "";

if (!WALLET_PRIV_KEY) {
  throw new Error("Wallet private key is not configured in env file");
}

if (!L1_RPC_URL) {
  throw new Error("Missing L1 RPC endpoint. Check chainlist.org or an RPC node provider");
}

if (!TOKEN_ADDRESS) {
  throw new Error("Missing address of the ERC-20 token in L1");
}

async function main() {
  console.log(`Running script to bridge ERC-20 to L2`);

  // Initialize the wallet.
  const l1provider = new Provider(L1_RPC_URL);
  const l2provider = new Provider(L2_RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, l2provider, l1provider);

  console.log(`L1 Balance is ${await wallet.getBalanceL1()}`);
  console.log(`L2 Balance is ${await wallet.getBalance()}`);

  // Deposit token to L2
  const depositHandle = await wallet.deposit({
    to: wallet.address, // can bridge to a different address in L2
    token: TOKEN_ADDRESS,
    amount: ethers.utils.parseEther(AMOUNT), // assumes ERC-20 has 18 decimals
    approveERC20: true,
  });
  console.log(`Deposit transaction sent ${depositHandle.hash}`);
  console.log(`Please wait a few minutes for the deposit to be processed in L2`);
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
