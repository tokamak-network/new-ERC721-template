const { ethers } = require("hardhat");
import { Erc20Bridger, getArbitrumNetwork } from '@arbitrum/sdk'
require('dotenv').config();

// npx hardhat run scripts/arbitrum/bridgeWstonToArbitrum.js --network sepolia

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Minting GEMs with the account:", deployer.address);
    const l1wstonProxyAddress = process.env.L1_WRAPPED_STAKED_TON_PROXY;
    const l2Provider = process.env.L2_RPC_URL;

    // Define the amount to deposit (in WSTON with 27 decimals)
    const wstonAmount = ethers.parseUnits('40628', 27); 

    try {
        const l2Network = await getArbitrumNetwork(l2Provider);
        const erc20Bridger = new Erc20Bridger(l2Network);
        
        /**
         * The Standard Gateway contract will ultimately be making the token transfer call; thus, that's the contract we need to approve.
         * erc20Bridger.approveToken handles this approval
         * Arguments required are:
         * (1) l1Signer: The L1 address transferring token to L2
         * (2) erc20L1Address: L1 address of the ERC20 token to be deposited to L2
         */
        console.log('Approving:');
        const approveTx = await erc20Bridger.approveToken({
          parentSigner: l1Wallet,
          erc20ParentAddress: l1wstonProxyAddress,
        });
        
        const approveRec = await approveTx.wait();
        console.log(
          `You successfully allowed the Arbitrum Bridge to spend DappToken ${approveRec.transactionHash}`,
        );

        /**
         * Deposit DappToken to L2 using erc20Bridger. This will escrow funds in the Gateway contract on L1, and send a message to mint tokens on L2.
         * The erc20Bridge.deposit method handles computing the necessary fees for automatic-execution of retryable tickets — maxSubmission cost & l2 gas price * gas — and will automatically forward the fees to L2 as callvalue
         * Also note that since this is the first DappToken deposit onto L2, a standard Arb ERC20 contract will automatically be deployed.
         * Arguments required are:
         * (1) amount: The amount of tokens to be transferred to L2
         * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
         * (2) l1Signer: The L1 address transferring token to L2
         * (3) l2Provider: An l2 provider
         */
        const depositTx = await erc20Bridger.deposit({
          amount: wstonAmount,
          erc20ParentAddress: l1wstonProxyAddress,
          parentSigner: deployer.address,
          childProvider: l2Provider,
        });

        /**
         * Now we wait for L1 and L2 side of transactions to be confirmed
         */
        const depositRec = await depositTx.wait();
        const l2Result = await depositRec.waitForChildTransactionReceipt(l2Provider);

        /**
         * The `complete` boolean tells us if the l1 to l2 message was successful
         */
        l2Result.complete
          ? console.log(`L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`)
          : console.log(`L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`);

        /**
         * Check if our l2Wallet DappToken balance has been updated correctly
         * To do so, we use erc20Bridge to get the l2Token address and contract
        */
        const l2TokenAddress = await erc20Bridger.getChildErc20Address(l1Erc20Address, l1Provider);
        const l2Token = erc20Bridger.getChildTokenContract(l2Provider, l2TokenAddress);
        console.log(`L2 WSTON address ${l2Token}`);
    } catch (error) {
        console.error('Error bridging WSTON:', error);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
