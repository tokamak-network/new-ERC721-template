const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

// command to run: "npx hardhat run scripts/optimism/3.deploySTON.js --network l2"

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance));

    // ------------------------ NFTFACTORY INSTANCE ---------------------------------

    // Instantiate the NFTFactory
    const NFTFactory = await ethers.getContractFactory("NFTFactory");
    const nftFactory = await NFTFactory.deploy();
    await nftFactory.deployed();
    console.log("NFTFactory deployed to:", nftFactory.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    // ------------------------ NFTFACTORY PROXY ---------------------------------

    const NFTFactoryProxy = await ethers.getContractFactory("NFTFactoryProxy");
    const nftFactoryProxy = await NFTFactoryProxy.deploy();
    await nftFactoryProxy.deployed();
    console.log("NFTFactoryProxy deployed to:", nftFactoryProxy.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    // Set the first index to the GemFactory contract
    const upgradeNFTFactoryTo = await nftFactoryProxy.upgradeTo(nftFactory.address);
    await upgradeNFTFactoryTo.wait();
    console.log("NFTFactoryProxy upgraded to NFTFactory");

    // ------------------------ TREASURY INSTANCE ---------------------------------

    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.deployed();
    console.log("Treasury deployed to:", treasury.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    // ------------------------ TREASURY PROXY INSTANCE ---------------------------------

    const TreasuryProxy = await ethers.getContractFactory("TreasuryProxy");
    const treasuryProxy = await TreasuryProxy.deploy();
    await treasuryProxy.deployed(); // Ensure deployment is complete
    console.log("TreasuryProxy deployed to:", treasuryProxy.address);

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds

    // Set the first index to the GemFactory contract
    const upgradeTreasuryTo = await treasuryProxy.upgradeTo(treasury.address);
    await upgradeTreasuryTo.wait();
    console.log("TreasuryProxy upgraded to Treasury");

        // ------------------------ UPDATE .ENV FILE ---------------------------------

    const envFilePath = path.join(__dirname, '../../.env'); // Path to the .env file
    const envVars = `
# Deployed Contract Addresses
NFT_FACTORY=${nftFactory.address}
NFT_FACTORY_PROXY=${nftFactoryProxy.address}
TREASURY=${treasury.address}
TREASURY_PROXY=${treasuryProxy.address}
`;

    // Append or update the .env file
    fs.appendFileSync(envFilePath, envVars);
    console.log("Updated .env file with contract addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
