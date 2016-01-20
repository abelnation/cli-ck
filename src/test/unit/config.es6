require('babel-polyfill')
const assert = require('chai').assert

const Click = require('../../cli-ck')

describe('yargs config', () => {
    describe('.name', () => {
        it('defaults to name of executing script from cli', () => {
            const result = new Click()
            // tests run with _mocha executable
            assert.equal(result.getName(), '_mocha')
        })
        it('can override the default', () => {
            const result = new Click().name('test')
            // tests run with _mocha executable
            assert.equal(result.getName(), 'test')
        })
    })
    describe('.version', () => {
        it('defaults to undefined', () => {
            const result = new Click()
            assert.isUndefined(result.getVersion())
        })

        it('sets config.version', () => {
            const version = '1.0.0'
            const result = new Click().version(version)
            assert.equal(result.getVersion(), version)
        })
    })

    describe('.usage', () => {
        it('defaults to undefined', () => {
            const result = new Click()
            assert.isUndefined(result.getUsage())
        })

        it('sets config.usage', () => {
            const usage = 'test usage'
            const result = new Click().usage(usage)
            assert.equal(result.getUsage(), usage)
        })
    })

    describe('.nargs', () => {
        it('defaults min/max to undefined', () => {
            const result = new Click()
            assert.isUndefined(result.getMinArgs())
            assert.isUndefined(result.getMaxArgs())
        })

        it('setting single value', () => {
            const nargs = 5
            const result = new Click().nargs(nargs)
            assert.equal(result.getMinArgs(), nargs)
            assert.equal(result.getMinArgs(), nargs)
        })

        it('setting just min value', () => {
            const min = 5
            const max = -1
            const result = new Click().nargs(min, max)
            assert.equal(result.getMinArgs(), min)
            assert.isUndefined(result.getMaxArgs())
        })

        it('setting just max value', () => {
            const min = -1
            const max = 10
            const result = new Click().nargs(min, max)
            assert.isUndefined(result.getMinArgs())
            assert.equal(result.getMaxArgs(), max)
        })

        it('setting both', () => {
            const min = 5
            const max = 10
            const result = new Click().nargs(min, max)
            assert.equal(result.getMinArgs(), min)
            assert.equal(result.getMaxArgs(), max)
        })

        it('error when setting min greater than max', () => {
            assert.throws(() => {
                const min = 1000
                const max = 10
                new Click().nargs(min, max)
            })
        })

        it('error when no args', () => {
            assert.throws(() => {
                new Click().nargs()
            })
        })
    })

    describe('.option', () => {

    })

    describe('.optionSet', () => {

    })

    describe('.command', () => {

    })

    describe('.handler', () => {
        it('defaults to undefined', () => {
            const result = new Click()
            assert.isUndefined(result.getHandler())
        })
        it('sets value', () => {
            const handler = () => { console.log('hi') }
            const result = new Click()
            result.handler(handler)
            assert.equal(result.getHandler(), handler)
        })
    })
})
