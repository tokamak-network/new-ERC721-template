# Deploy your protocol on ZKSYNC


## Bridge WSTON to zkSync

use the `bridgeWstonToZkSync.js` script to transfer your WSTON to arbitrum
Please ensure your .env file is up to date.
run:

```
npx hardhat run scripts/zkSync/3.bridgeWstonToZkSync.js --network l1
```
NB: please first adjust the amount to bridge within the script (line 11)

## deploy your STON token on Optimism

```
npx hardhat run scripts/zkSync/4.deploySTON.js --network l2
```

## initialize your contracts

```
npx hardhat run scripts/zkSync/5.Initialization.js --network l2
```
