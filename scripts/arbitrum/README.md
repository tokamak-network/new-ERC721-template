# Deploy your protocol on ARBITRUM


## Bridge WSTON to Arbitrum

use the `bridgeWstonToArbitrum.js` script to transfer your WSTON to arbitrum
Please ensure your .env file is up to date.
note: please first adjust the amount to bridge within the script (line 12)
run:

```
npx hardhat run scripts/arbitrum/bridgeWstonToArbitrum.js --network l1
```


## deploy your STON token on Arbitrum

run:
```
npx hardhat run scripts/arbitrum/deploySTON.js --network l2
```