## Prequests

a) nodejs 10.15.1 or above

b) load required module (meterify) and provision the provider 

```
const meterify = require("meterify").meterify;
const Web3 = require("web3");
const web3 = meterify(new Web3(), "http://localhost:8669");
```

c) prepare accounts for meterify
"web3.eth.accounts.create()" can easily create accounts. In this test, two accouns are created.  

Add private keys into wallet.

```
web3.eth.accounts.wallet.add('keys')
web3.eth.accounts.wallet;
```

## Send transactions in nodejs

The unit in meterify is Wei. 1 MTR = 10e18 Wei and 1 MTRG = 10e18 WeiG

a)transfer MTR
web3.eth.sendTransaction({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', to: '0x8A88c59bF15451F9Deb1d62f7734FeCe2002668E', value: '99000000000000000000', data: '00' }).then (function(receipt) {  }).then(function(data){console.log(data)});

b)transfer MTRG
web3.eth.sendTransaction({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', to: '0x8A88c59bF15451F9Deb1d62f7734FeCe2002668E', value: '99000000000000000000', data: '01' }).then (function(receipt) {console.log(receipt)  })


## Run contranct in nodejs

a) compile contract

```
code = fs.readFileSync('sample_token.sol').toString()
solc = require('solc')
compiledCode = solc.compile(code)

token_abiDefinition = JSON.parse(compiledCode.contracts[':SAMPLEToken'].interface)
token_byteCode = compiledCode.contracts[':SAMPLEToken'].bytecode
token_byteCode = "0x" + token_byteCode;
```

b) deploy the contract byte code to blockchain

```
contractInstance = new web3.eth.Contract(token_abiDefinition)
contractInstance.options.data = token_byteCode
contractInstance.deploy({arguments: ['0x0205c2D862cA051010698b69b54278cbAf945C0b', '1000000000', 'Sample Token', '3', 'STOKEN']}).send({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', gas: 4700000 }).then((newContractInstance) => {console.log(newContractInstance.options.address)})
```

Once the contract is deployed, the contract address is printed out. Set contract option address like the following.

```
contractInstance.options.address = '0xE4B3262661328cc4d3d64D2b1169Ff65cE89c99F'
```

c) now the contract is deployed, regiester the events

contractInstance.events.allEvents({ }, (error, result) => { if(error){ console.log(error) } else { console.log(result) } })

d) the message call all the methods in contracts.

The followings are a few examples message call

```
contractInstance.methods._transferFrom('0x0205c2D862cA051010698b69b54278cbAf945C0b', '0x8A88c59bF15451F9Deb1d62f7734FeCe2002668E', '9999').send({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', gas: 4700000 }).then(function(data){console.log(data)}).catch(function(err){console.log(err)})

contractInstance.methods.getAccountBalanceOf('0x0205c2D862cA051010698b69b54278cbAf945C0b').send({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', gas: 4700000 }).then(function(data){console.log(data)}).catch(function(err){console.log(err)})

contractInstance.methods.getAccountBalanceOf('0x0205c2D862cA051010698b69b54278cbAf945C0b').call({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', gas: 4700000 }).then(function(data){console.log(data)}).catch(function(err){console.log(err)})
contractInstance.methods.mintToken('0x0205c2D862cA051010698b69b54278cbAf945C0b', '99999999999999999999999').send({from: '0x0205c2D862cA051010698b69b54278cbAf945C0b', gas: 4700000 }).then(function(data){console.log(data)}).catch(function(err){console.log(err)})
```

