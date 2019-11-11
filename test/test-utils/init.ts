'use strict'

import rewiremock from 'rewiremock'
import FakeWebSocket = require('./fake-ws')
import FakeXHR2 = require('./fake-xhr2')
const Web3 = require('web3')

// Test utilities
const xhrUtility = new FakeXHR2()
const wsUtility = new FakeWebSocket('')
wsUtility.close()

rewiremock('xhr2').with(require('./fake-xhr2'))
rewiremock('isomorphic-ws').with(require('./fake-ws'))

rewiremock.enable()

import { meterify } from '../../src'
const web3 = meterify(new Web3())

export {
    web3,
    xhrUtility,
    wsUtility,
}
