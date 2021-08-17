"use strict";


const debug = require('debug')('meter:injector')
import { cry, Transaction } from '@meterio/devkit'
import { Callback, EthTransaction } from '../types'
import * as utils from '../utils'

const extendAccounts = function(web3: any): any {

    const web3Utils = web3.utils
    // signTransaction supports both callback and promise style
    web3.eth.accounts.signTransaction = function signTransaction(
        ethTx: EthTransaction,
        privateKey: string,
        callback: Callback
    ) {
        debug("tx to sign: %O", ethTx);

        const sign = async function(tx: EthTransaction) {
            if (!tx.chainTag) {
                const chainTag = await web3.eth.getChainTag();
                if (chainTag) {
                    tx.chainTag = chainTag;
                } else {
                    throw new Error("error getting chainTag");
                }
            }
            if (!tx.blockRef) {
                const blockRef = await web3.eth.getBlockRef();
                if (blockRef) {
                    tx.blockRef = blockRef;
                } else {
                    throw new Error("error getting blockRef");
                }
            }

            // take the token type if there is 
            let token = 0;
            if (tx.data && tx.data.length >= 10) { 
                if (tx.data.startsWith('0x')){
                    // remove 0x prefix
                    tx.data = tx.data.substring(2, tx.data.length);
                }
                let tokenStr = tx.data.substring(0, 8);
                if (tx.to != null && tokenStr === "00000000") {
                    // if tx.data startswith 00000000, this is a special prefix for token data
                    // the 5th byte will indicate whether it's a MTR (0) clause or MTRG (1) clause
                    token = Number(tx.data.substring(8,10)) > 0 ? 1 : 0;
                    tx.data = tx.data.substring(10,tx.data.length)
                }
            }

            if (tx.data && utils.isHex(tx.data)) {
                tx.data = utils.toPrefixedHex(tx.data);
            } else if (tx.data) {
                throw new Error("Data must be valid hex");
            } else {
                tx.data = "0x";
            }
            if (!tx.gas) {
                const pubKey = cry.secp256k1.derivePublicKey(Buffer.from(utils.sanitizeHex(privateKey), 'hex'))
                const from = '0x' + cry.publicKeyToAddress(pubKey).toString('hex');
                const gas = await web3.eth.estimateGas({
                    from,
                    to: tx.to ? tx.to : '',
                    value: tx.value ? tx.value : 0,
                    data: tx.data,
                    token,
                })
                tx.gas = gas
            }
            if (!tx.nonce) {
                tx.nonce = utils.newNonce();
            }

            const clause: Transaction.Clause = {
                value: tx.value || 0,
                to: tx.to || null,
                data: tx.data,
                token: token
            };

            const body: Transaction.Body = {
                chainTag: utils.validNumberOrDefault(tx.chainTag, 0),
                blockRef: tx.blockRef as string,
                gas: tx.gas as number,
                expiration: utils.validNumberOrDefault(
                    tx.expiration,
                    utils.params.defaultExpiration
                ),
                gasPriceCoef: utils.validNumberOrDefault(
                    tx.gasPriceCoef,
                    utils.params.defaultGasPriceCoef
                ),
                dependsOn: !tx.dependsOn ? null : tx.dependsOn,
                nonce:
                    typeof tx.nonce === "string"
                        ? utils.toPrefixedHex(tx.nonce)
                        : tx.nonce,
                clauses: [clause]
            };

            debug("body: %O", body);

            const MeterTx = new Transaction(body);
            const priKey = Buffer.from(utils.sanitizeHex(privateKey), "hex");
            const signingHash = cry.blake2b256(MeterTx.encode());
            MeterTx.signature = cry.secp256k1.sign(signingHash, priKey);

            const result = {
                rawTransaction: utils.toPrefixedHex(
                    MeterTx.encode().toString("hex")
                ),
                messageHash: signingHash
            };

            return result;
        };

        // for supporting both callback and promise
        if (callback instanceof Function) {
            sign(ethTx)
                .then(ret => {
                    return callback(null, ret);
                })
                .catch(e => {
                    return callback(e);
                });
        } else {
            return sign(ethTx);
        }
    }

    web3.eth.accounts.recoverTransaction = function recoverTransaction(encodedRawTx: string) {
        const decoded = Transaction.decode(Buffer.from(utils.sanitizeHex(encodedRawTx), 'hex'))
        return decoded.origin
    }

    web3.eth.accounts.hashMessage = function hashMessage(data: string | Buffer) {
        const message = web3Utils.isHexStrict(data) ? web3Utils.hexToBytes(data) : data
        const messageBuffer = Buffer.from(message)
        const prefix = '\u0019Meter Signed Message:\n' + message.length.toString()
        const prefixBuffer = Buffer.from(prefix)
        const prefixedMessage = Buffer.concat([prefixBuffer, messageBuffer])

        return utils.toPrefixedHex(cry.blake2b256(prefixedMessage).toString('hex'))
    }

    web3.eth.accounts.sign = function sign(data: string | Buffer, privateKey: string) {
        const hash = this.hashMessage(data)
        const hashBuffer = Buffer.from(utils.sanitizeHex(hash), 'hex')
        const privateKeyBuffer = Buffer.from(utils.sanitizeHex(privateKey), 'hex')
        const signature = cry.secp256k1.sign(hashBuffer, privateKeyBuffer).toString('hex')

        return {
            message: data,
            messageHash: utils.toPrefixedHex(hash),
            signature: utils.toPrefixedHex(signature)
        };
    };

    web3.eth.accounts.recover = function recover(message: any, signature: string, preFixed: boolean) {

        if (utils.isObject(message)) {
            return this.recover(message.messageHash, message.signature, true);
        }

        if (!preFixed) {
            message = this.hashMessage(message);
        }

        const hexBuffer = Buffer.from(utils.sanitizeHex(message), "hex");
        const signatureBuffer = Buffer.from(
            utils.sanitizeHex(signature),
            "hex"
        );
        const pubKey = cry.secp256k1.recover(hexBuffer, signatureBuffer);
        const address = cry.publicKeyToAddress(pubKey);

        return utils.toPrefixedHex(address.toString("hex"));
    };
};

export { extendAccounts };
