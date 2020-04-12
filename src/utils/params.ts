'use strict'

// params from meter source code and meter foundation's suggestion
const params = {
    defaultGasPriceCoef: 128,
    defaultExpiration: 720,
    TxGas: 5000,
    ClauseGas: 21000 - 5000,
    ClauseGasContractCreation: 53000 - 5000,
    TxDataZeroGas: 4,
    TxDataNonZeroGas: 68,
}

export {
    params,
}
