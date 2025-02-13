# Deploy your protocol on TRH


## Bridge WSTON to TRH

use the `bridgeWstonToTrh.js` script to transfer your WSTON to arbitrum
Please ensure your .env file is up to date.
run:

```
npx hardhat run scripts/trh/bridgeWstonToTrh.js --network l1
```
NB: please first adjust the amount to bridge within the script (line 12)

## deploy your STON token on TRH
