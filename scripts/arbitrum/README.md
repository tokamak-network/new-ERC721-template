# Deploy your protocol on ARBITRUM

## Get Wston

run:
```
npx hardhat run scripts/arbitrum/1.depositAndGetWston.js --network l1
```

## Bridge WSTON to Arbitrum

use the `bridgeWstonToArbitrum.js` script to transfer your WSTON to arbitrum
Please ensure your .env file is up to date.
note: please first adjust the amount to bridge within the script (line 12)
run:

```
npx hardhat run scripts/arbitrum/2.bridgeWstonToArbitrum.js --network l1
```


## deploy your STON contracts on Arbitrum

run:
```
npx hardhat run scripts/arbitrum/3.deploySTON.js --network l2
```

## initialize your STON contracts on Arbitrum

run:
```
npx hardhat run scripts/arbitrum/4.initialization.js --network l2
```