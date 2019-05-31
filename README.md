## Meterify &nbsp;&nbsp; 


A web3 adaptor for Meter [Meter] RESTful API.


## Table of contents

* [Install](#install)
* [Usage](#usage)
* [Web3 method supported](#web3-method-supported)
* [Send transaction](#send-transaction)
* [Play with multi-clause](#play-with-multi-clause)
* [FAQ](#faq)
    * [Method not supported](#method-not-supported)
* [Notes](#notes)
* [Compatibility](#compatibility)

## Install

``` bash
npm install --save meterify
npm install --save web3@1.0.0-beta.37   # Web3 is needed as dependency.
```

## Usage

``` javascript
// ES6 style
import { meterify } from "meterify";
const Web3 = require("web3");		// Recommend using require() instead of import here

const web3 = meterify(new Web3(), "http://localhost:8669");

web3.eth.getBlock("latest").then(res => console.log(res));
// Best block info will be displayed
```

If you would like to write code in ES5, check below for the initialization code.

``` javascript
// ES5 style
const meterify = require("meterify").meterify;
const Web3 = require("web3");

const web3 = meterify(new Web3(), "http://localhost:8669");

web3.eth.getBlock("latest").then(res => console.log(res));
// Best block info will be displayed
```

## Web3 method supported

```
web3 instance
├── eth
│   ├── getBlockNumber
│   ├── getBalance
│   ├── getStorageAt
│   ├── getCode
│   ├── getBlock
│   ├── getTransaction
│   ├── getTransactionReceipt
│   ├── sendTransaction
│   ├── sendSignedTransaction
│   ├── call
│   ├── estimateGas
│   ├── getPastLogs
│   ├── subscribe
│   ├── clearSubscriptions
│   ├── getEnergy
│   ├── getChainTag
│   ├── getBlockRef
│   ├── accounts
│   └── Contract
│       ├── Constructor(new Contract())
│       ├── clone
│       ├── deploy
│       ├── methods
│       ├── methods.myMethod.call
│       ├── methods.myMethod.send
│       ├── methods.myMethod.estimateGas
│       ├── methods.myMethod.encodeABI
│       ├── events
│       ├── once
│       ├── events.myEvent
│       ├── events.allEvents
│       └── getPastEvents
└── utils

```

## Send Transaction

In Meter official implementation , the client **DOES NOT** neither manage user's private-key/keyStore nor use private key to sign a Transaction. Unfortunately, meterify can not directly perform `eth_sendTransaction` but there is another way to sign a transaction.

In [web3.js accounts](https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#eth-accounts), it gives the opportunity to add your private-key, stored in your runtime context (In Node.js context, it's stored in memory while in Browser context, it's stored in memory/local storage), to accounts module. When you are trying to send a transaction, the module will check the private key associated with from field. Once the private key and from have been matched, the module will sign the transaction.
The APIs that follows the mechanism are:

+ `web3.eth.sendTransaction()`
+ `contract.deploy.send()`
+ `contract.methods.myMethod.send()`

## Documentation

[API Reference]

## Play with multi-clause

1. [meter-devkit.js](https://github.com/dfinlab/meter-devkit.js) supports multi-clause and sign transaction
2. send signed transaction using [sendSignedTransaction]

## FAQ

If you are writing some application or scripts executing in `Node.js` or `Browser` environment, you should use `Meterify`.

### Method not supported

The RESTful API of Meter is different with Ethereum's JSON-RPC, therefore, there are some methods in web3 are not supported by meterify, feel free to open an issue discuss the features.

There is a possibility that when you trying to call `sendTransaction` or `send` functions, meterify will return `Method not supported` under version 0.3.1, due to account module will check the private key associated with `from` field. After upgrade to version 0.3.1 or newer, meterify will show `The private key corresponding to from filed can't be found in local eth.accounts.wallet ` to make an error more specific.

## Notes

- There are three special block number in Ethereum: `earliest`,`latest`,`pending`. In Meter, we introduced `best` block and there is no `pending` block, so they will be replaced with `0` (aka genesis), `best`, `best`

## Compatibility

Currently, `meterify` is compatible with `>= web3@1.0.0-beta.1` and `<= web3@1.0.0-beta.37`.

