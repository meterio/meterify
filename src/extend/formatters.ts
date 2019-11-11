'use strict'
const debug = require('debug')('meter:injector')
import { LogFilterOptions, TransferFilterOptions } from '../types'
import * as utils from '../utils'

const extendFormatters = function(web3: any) {

    const web3Utils = web3.utils
    const outputTransactionFormatter = web3.extend.formatters.outputTransactionFormatter
    web3.extend.formatters.outputTransactionFormatter = function(tx: any) {
        if (tx && tx.isMeterified) {
            debug('outputTransactionFormatter')
            tx.chainTag = web3Utils.numberToHex(tx.chainTag)

            if (tx.clauses) {
                for (const clause of tx.clauses) {
                    clause.value = web3.extend.formatters.outputBigNumberFormatter(clause.value)
                }
            }
            return tx
        } else {
            return outputTransactionFormatter(tx)
        }
    }

    const outputTransactionReceiptFormatter = web3.extend.formatters.outputTransactionReceiptFormatter
    web3.extend.formatters.outputTransactionReceiptFormatter = function(receipt: any) {
        if (receipt && receipt.isMeterified) {
            debug('outputTransactionReceiptFormatter')

            if (receipt.hasOwnProperty('transactionIndex')) {
                delete receipt.transactionIndex
            }
            if (receipt.hasOwnProperty('cumulativeGasUsed')) {
                delete receipt.cumulativeGasUsed
            }

            receipt.gasUsed = web3Utils.hexToNumber(receipt.gasUsed)

            for (const output of receipt.outputs) {
                if (web3Utils._.isArray(output.events)) {
                    output.events = output.events.map((event: any) => {
                        if (!event.isMeterified) {
                            Object.defineProperty(event, 'isMeterified', { get: () => true })
                        }
                        return web3.extend.formatters.outputLogFormatter(event)
                    })
                }
            }

            return receipt
        } else {
            return outputTransactionReceiptFormatter(receipt)
        }
    }

    const outputLogFormatter = web3.extend.formatters.outputLogFormatter
    web3.extend.formatters.outputLogFormatter = function(log: any) {
        if (log && log.isMeterified) {
            debug('outputLogFormatter')
            if (log.hasOwnProperty('transactionIndex')) {
                delete log.transactionIndex
            }
            if (log.hasOwnProperty('logIndex')) {
                delete log.logIndex
            }
            if (log.hasOwnProperty('id')) {
                delete log.id
            }

            return log
        } else {
            return outputLogFormatter(log)
        }
    }
}

const inputLogFilterFormatter = function(options: LogFilterOptions) {
    if (options) {
        const logFilterOptions: LogFilterOptions = {}
        if (options.address) {
            logFilterOptions.address = utils.validAddressOrError(options.address)
        }
        if (options.pos) {
            logFilterOptions.pos = utils.validBytes32OrError(options.pos, 'Invalid position(block ID)')
        }
        if (options.t0) {
            logFilterOptions.t0 = utils.validBytes32OrError(options.t0, 'Invalid t0')
        }
        if (options.t1) {
            logFilterOptions.t1 = utils.validBytes32OrError(options.t1, 'Invalid t1')
        }
        if (options.t2) {
            logFilterOptions.t2 = utils.validBytes32OrError(options.t2, 'Invalid t2')
        }
        if (options.t3) {
            logFilterOptions.t3 = utils.validBytes32OrError(options.t3, 'Invalid t3')
        }
        if (options.t4) {
            logFilterOptions.t4 = utils.validBytes32OrError(options.t4, 'Invalid t4')
        }
        return logFilterOptions
    }
}

const inputBlockFilterFormatter = function(blockID: string|null) {
    if (blockID) {
        blockID = utils.validBytes32OrError(blockID, 'Invalid position(block ID)')
        return blockID
    }
}

const inputTransferFilterFormatter = function(options: TransferFilterOptions) {
    if (options) {
        const transferFilterOptions: TransferFilterOptions = {}
        if (options.pos) {
            transferFilterOptions.pos = utils.validBytes32OrError(options.pos, 'Invalid position(block ID)')
        }
        if (options.txOrigin) {
            transferFilterOptions.txOrigin = utils.validAddressOrError(options.txOrigin)
        }
        if (options.sender) {
            transferFilterOptions.sender = utils.validAddressOrError(options.sender)
        }
        if (options.recipient) {
            transferFilterOptions.recipient = utils.validAddressOrError(options.recipient)
        }
        return transferFilterOptions
    }
}

export {
    extendFormatters,
    inputLogFilterFormatter,
    inputBlockFilterFormatter,
    inputTransferFilterFormatter,
}
