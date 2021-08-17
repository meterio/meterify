'use strict'

import { expect } from 'chai'
import { meterify } from '../../src'
import {MeterProvider} from '../../src/provider'
const Web3 = require('web3')

describe('initialization', () => {
    it('init meterify should not throw error', () => {
        const web3 = new Web3()
        meterify(web3, 'http://localhost:8669', 0)
    })

    it('init meterify without host', () => {
        const web3 = new Web3()
        meterify(web3)

        expect(web3.currentProvider).to.have.property('RESTHost', 'http://localhost:8669')
        expect(web3.currentProvider).to.have.property('WSHost', 'ws://localhost:8669')
        expect(web3.currentProvider).to.have.property('timeout', 0)
    })

    it('providers should be MeterProvider', () => {
        const web3 = new Web3()
        meterify(web3)

        expect(web3.currentProvider instanceof MeterProvider).to.be.equal(true)
        expect(web3.eth.currentProvider instanceof MeterProvider).to.be.equal(true)
        expect(web3.eth.accounts.currentProvider instanceof MeterProvider).to.be.equal(true)
        expect(web3.eth.Contract.currentProvider instanceof MeterProvider).to.be.equal(true)
    })

})
