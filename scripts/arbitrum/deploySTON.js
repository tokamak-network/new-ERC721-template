const { ethers, run } = require("hardhat");
require('dotenv').config();

// run: "npx hardhat run scripts/arbitrum/deploySTON.js --network l2"

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance));

    // ------------------------ NFTFACTORY INSTANCE ---------------------------------

    const NFTFactory = await ethers.getContractFactory("NFTFactory");
    const nftFactory = await NFTFactory.deploy();
    await nftFactory.deployed();
    console.log("NFTFactory deployed to:", nftFactory.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    await run("verify:verify", {
        address: nftFactory.address,
        constructorArguments: [],
    });

    // ------------------------ NFTFACTORY PROXY ---------------------------------

    const NFTFactoryProxy = await ethers.getContractFactory("NFTFactoryProxy");
    const nftFactoryProxy = await NFTFactoryProxy.deploy();
    await nftFactoryProxy.deployed();
    console.log("NFTFactoryProxy deployed to:", nftFactoryProxy.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    await run("verify:verify", {
        address: nftFactoryProxy.address,
        constructorArguments: [],
        contract: "contracts/NFTFactoryProxy.sol:NFTFactoryProxy"
    });

    const upgradeNFTFactoryTo = await nftFactoryProxy.upgradeTo(nftFactory.address);
    await upgradeNFTFactoryTo.wait();
    console.log("NFTFactoryProxy upgraded to NFTFactory");

    // ------------------------ TREASURY INSTANCE ---------------------------------

    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.deployed();
    console.log("Treasury deployed to:", treasury.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    await run("verify:verify", {
        address: treasury.address,
        constructorArguments: [],
        contract: "contracts/Treasury.sol:Treasury"
    });

    // ------------------------ TREASURY PROXY INSTANCE ---------------------------------

    const TreasuryProxy = await ethers.getContractFactory("TreasuryProxy");
    const treasuryProxy = await TreasuryProxy.deploy();
    await treasuryProxy.deployed();
    console.log("TreasuryProxy deployed to:", treasuryProxy.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    await run("verify:verify", {
        address: treasuryProxy.address,
        constructorArguments: [],
        contract: "contracts/TreasuryProxy.sol:TreasuryProxy"
    });
    console.log("TreasuryProxy verified");

    const upgradeTreasuryTo = await treasuryProxy.upgradeTo(treasury.address);
    await upgradeTreasuryTo.wait();
    console.log("TreasuryProxy upgraded to Treasury");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
