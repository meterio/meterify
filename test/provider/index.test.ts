'use strict'
import { expect } from 'chai'
import { MeterProvider } from '../../src/provider'

describe('meter-provider initialization', () => {

    it('should throw error if called without empty host', () => {
        expect(() => { const provider = new MeterProvider(''); return provider }).to.throw('[meter-provider]Meterify requires that the host be specified(e.g. "http://localhost:8669")')
    })

    it('should parse url', () => {
        const provider = new MeterProvider('http://localhost:8669')
        expect(provider).to.have.property('RESTHost', 'http://localhost:8669')
        expect(provider).to.have.property('WSHost', 'ws://localhost:8669')
    })

    it('should parse url with https', () => {
        const provider = new MeterProvider('https://localhost:8669')
        expect(provider).to.have.property('RESTHost', 'https://localhost:8669')
        expect(provider).to.have.property('WSHost', 'wss://localhost:8669')
    })

    it('should throw error with wrong', () => {
        expect(() => {
            return new MeterProvider('invalidurl')
        }).to.throw('[meter-provider]Parsing url failed!')
    })

})

describe('meter-provider methods', () => {

    it('not supported method should return error ', (done) => {
        const provider = new MeterProvider('http://localhost:8669')
        provider.sendAsync({
            method: 'not supported method',
        }, (err, ret) => {
            if (err) {
                done(new Error('Return error in wrong place!'))
            }
            if (ret.error) {
                expect(ret.error.message).to.be.equal('[meter-provider]Method not supported!')
                done()
            } else {
                done(new Error('No error thrown!'))
            }
        })
    })

    it('eth_sendTransaction method should throw error', (done) => {
        const provider = new MeterProvider('http://localhost:8669')
        provider.sendAsync({
            method: 'eth_sendTransaction',
        }, (err, ret) => {
            if (err) {
                done(new Error('Return error in wrong place!'))
            }
            if (ret.error) {
                expect(ret.error.message).to.be.equal('[meter-provider]The private key corresponding to from filed can\'t be found in local eth.accounts.wallet!')
                done()
            } else {
                done(new Error('No error thrown!'))
            }
        })
    })

})

describe('subscriptions', () => {

    it('subscribe an unsupported subscription should return error', (done) => {
        const provider = new MeterProvider('http://localhost:8669')
        provider.sendAsync({
            method: 'eth_subscribe',
            params: ['unsupported'],
        }, (err, ret) => {
            if (err) {
                done(new Error('Return error in wrong place!'))
            }
            if (ret.error) {
                expect(ret.error.message).to.be.equal('Subscription unsupported not supported!')
                done()
            } else {
                done(new Error('No error thrown!'))
            }
        })
    })

    it('unsubscribe not exist subscription should return true', (done) => {
        const provider = new MeterProvider('http://localhost:8669')
        provider.sendAsync({
            method: 'eth_unsubscribe',
            params: [100],
        }, (err, ret) => {
            try {
                expect(ret.result).to.be.equal(true)
                done()
            } catch (e) {
              done(e)
            }
        })
    })

})
