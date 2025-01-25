const { ethers } = require('ethers');
const { providers, Wallet } = require('ethers');
const { getArbitrumNetwork, Erc20Bridger } = require('@arbitrum/sdk');
require('dotenv').config();

const walletPrivateKey = process.env.PRIVATE_KEY;
const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1_RPC_URL);
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2_RPC_URL);
const l1Wallet = new Wallet(walletPrivateKey, l1Provider);

// npx hardhat run scripts/arbitrum/2.bridgeWstonToArbitrum.js --network sepolia

const amount = 100000000000000000000000000000n;

const main = async () => {
    /**
     * Use l2Network to create an Arbitrum SDK Erc20Bridger instance
     * We'll use Erc20Bridger for its convenience methods around transferring token to L2
     */
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
    const l1Erc20Address = process.env.L1_WRAPPED_STAKED_TON_PROXY;
    const approveTx = await erc20Bridger.approveToken({
        parentSigner: l1Wallet,
        erc20ParentAddress: l1Erc20Address,
    });

    const approveRec = await approveTx.wait();
    console.log(
    `You successfully allowed the Arbitrum Bridge to spend WSTON ${approveRec.transactionHash}`,
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
        amount: amount,
        erc20ParentAddress: l1Erc20Address,
        parentSigner: l1Wallet,
        childProvider: l2Provider,
    });

    
    /**
     * Now we wait for L1 and L2 side of transactions to be confirmed
    */
    const depositRec = await depositTx.wait();
    const l2Result = await depositRec.waitForChildTransactionReceipt(l2Provider);

    console.log(`deposit successful: ${l2Result}`);


    /**
     * Check if our l2Wallet DappToken balance has been updated correctly
     * To do so, we use erc20Bridge to get the l2Token address and contract
     */
    const l2TokenAddress = await erc20Bridger.getChildErc20Address(l1Erc20Address, l1Provider);
    const l2Token = erc20Bridger.getChildTokenContract(l2Provider, l2TokenAddress);
    console.log(`L2 WSTON: ${l2Token}`);
};

main().then(() => process.exit(0)).catch((error) => {
    console.error('Error in main:', error);
    process.exit(1);
});
