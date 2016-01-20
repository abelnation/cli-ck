require('babel-polyfill')
const assert = require('chai').assert

const Click = require('../../cli-ck')
const Parser = require('../../parser')

const basicOptions = require('../fixtures/basic-options')

describe('Parser', () => {
    describe('parse', () => {
        describe('arguments', () => {

        })
        describe('long-form options', () => {
            describe('booleans', () => {
                it('absence of option sets value to false', () => {
                    const result = basicOptions.parse('')
                    assert.isFalse(result.opts['ex-boolean'])
                })
                it('presence of option sets value to true', () => {
                    const result = basicOptions.parse('--ex-boolean')
                    assert.isTrue(result.opts['ex-boolean'])
                })
                it('can be explicitly set to false using "=" syntax', () => {
                    const result = basicOptions.parse('--ex-boolean=false')
                    assert.isFalse(result.opts['ex-boolean'])
                })
                it('can be explicitly set to true using "=" syntax', () => {
                    const result = basicOptions.parse('--ex-boolean=true')
                    assert.isTrue(result.opts['ex-boolean'])
                })
                it('sets for aliases', () => {
                    const result = basicOptions.parse('--ex-boolean')
                    assert.isTrue(result.opts['ex-boolean'])
                    assert.isTrue(result.opts['b'])
                })
            })

            describe('counts', () => {
                it('defaults to 0', () => {
                    const result = basicOptions.parse('')
                    assert.isDefined(result.opts['ex-count'])
                    assert.equal(result.opts['ex-count'], 0)
                })
                it('counts num of args provided', () => {
                    assert.equal(basicOptions.parse('').opts['ex-count'], 0)
                    assert.equal(basicOptions.parse('--ex-count').opts['ex-count'], 1)
                    assert.equal(basicOptions.parse('--ex-count a --ex-count b --foo').opts['ex-count'], 2)
                    assert.equal(basicOptions.parse('--ex-count --ex-count b c --ex-count').opts['ex-count'], 3)
                })
                it('can set count explicitly', () => {
                    assert.equal(basicOptions.parse('--ex-count=2').opts['ex-count'], 2)
                    assert.equal(basicOptions.parse('--ex-count=3').opts['ex-count'], 3)
                })
                it('presence of option restarts at 0 instead of defaultValue', () => {
                    const parser = new Click()
                    parser.option('cdef', {
                        alias: 'c',
                        count: true,
                        defaultValue: 3
                    })
                    assert.equal(parser.parse('').opts['cdef'], 3)
                    assert.equal(parser.parse('--cdef').opts['cdef'], 1)
                    assert.equal(parser.parse('--cdef a --cdef b --foo').opts['cdef'], 2)
                    assert.equal(parser.parse('--cdef --cdef b c --cdef').opts['cdef'], 3)
                })
                it('sets for aliases', () => {
                    const result = basicOptions.parse('--ex-count')
                    assert.equal(result.opts['ex-count'], 1)
                    assert.equal(result.opts['c'], 1)
                })
            })

            describe('numbers', () => {
                it('defaults to undefined', () => {
                    const result = basicOptions.parse('')
                    assert.isUndefined(result.opts['ex-number'])
                })
                it('results in number type', () => {
                    const result = basicOptions.parse('--ex-number 123')
                    assert.isNumber(result.opts['ex-number'])
                    assert.equal(result.opts['ex-number'], 123)
                })
                it('parses floats', () => {
                    const result = basicOptions.parse('--ex-number 1.5')
                    assert.isNumber(result.opts['ex-number'])
                    assert.equal(result.opts['ex-number'], 1.5)
                })
                it('can be set with "=" syntax', () => {
                    const result = basicOptions.parse('--ex-number=1.5')
                    assert.isNumber(result.opts['ex-number'])
                    assert.equal(result.opts['ex-number'], 1.5)
                })
                it('sets for aliases', () => {
                    const result = basicOptions.parse('--ex-number=123')
                    assert.equal(result.opts['ex-number'], 123)
                    assert.equal(result.opts['n'], 123)
                })
            })

            describe('strings', () => {
                it('defaults to undefined', () => {
                    const result = basicOptions.parse('')
                    assert.isUndefined(result.opts['ex-string'])
                })
                it('results in string type', () => {
                    const result = basicOptions.parse('--ex-string abc')
                    assert.isString(result.opts['ex-string'])
                    assert.equal(result.opts['ex-string'], 'abc')
                })
                it('handles quoted strings with spaces', () => {
                    const result = basicOptions.parse('--ex-string "hello, world!"')
                    assert.isString(result.opts['ex-string'])
                    assert.equal(result.opts['ex-string'], 'hello, world!')
                })
                it('when quoted, can be set with "=" syntax', () => {
                    const result = basicOptions.parse('--ex-string="hello, world!"')
                    assert.isString(result.opts['ex-string'])
                    assert.equal(result.opts['ex-string'], 'hello, world!')
                })
                it('can be set with "=" syntax', () => {
                    const result = basicOptions.parse('--ex-string=hello')
                    assert.isString(result.opts['ex-string'])
                    assert.equal(result.opts['ex-string'], 'hello')
                })
                it('sets for aliases', () => {
                    const result = basicOptions.parse('--ex-string=abc')
                    assert.equal(result.opts['ex-string'], 'abc')
                    assert.equal(result.opts['s'], 'abc')
                })
            })

        })
        describe('short-form options', () => {
            describe('booleans', () => {
                it('when absent, defaults to false', () => {
                    const result = basicOptions.parse('')
                    assert.isBoolean(result.opts['ex-boolean'])
                    assert.isFalse(result.opts['ex-boolean'])
                })
                it('can be set by short flag', () => {
                    const result = basicOptions.parse('-b')
                    assert.isBoolean(result.opts['ex-boolean'])
                    assert.isTrue(result.opts['ex-boolean'])
                })
                it('is not set when absent from short flag group', () => {
                    const result = basicOptions.parse('-xyz')
                    assert.isBoolean(result.opts['ex-boolean'])
                    assert.isFalse(result.opts['ex-boolean'])
                })
                it('can be set by short flag group', () => {
                    const result = basicOptions.parse('-xybz')
                    assert.isBoolean(result.opts['ex-boolean'])
                    assert.isTrue(result.opts['ex-boolean'])
                })
            })

            describe('counts', () => {
                it('can be set by short flag', () => {
                    assert.equal(basicOptions.parse('-c').opts.c, 1)
                })
                it('multiple short flags add to value', () => {
                    assert.equal(basicOptions.parse('-cccc').opts.c, 4)
                })
                it('aggregating works when separated', () => {
                    assert.equal(basicOptions.parse('-cab -c -xyc --ex-count').opts.c, 4)
                })
            })

            describe('numbers', () => {
                it('can be set by short flag', () => {
                    assert.equal(basicOptions.parse('-n 123').opts.n, 123)
                })
                it('cannot be set with "=" syntax', () => {
                    assert.throws(() => {
                        result = basicOptions.parse('-n=123')
                    })
                })
                it('last value takes precedence', () => {
                    const result = basicOptions.parse('-n 123 -n 456')
                    assert.equal(result.opts.n, 456)
                })
            })

            describe('strings', () => {
                it('can be set by short flag', () => {
                    assert.equal(basicOptions.parse('-s hello').opts.s, 'hello')
                })
                it('cannot be set with "=" syntax', () => {
                    assert.throws(() => {
                        basicOptions.parse('-s=hello')
                    })
                })
                it('last value takes precedence', () => {
                    const result = basicOptions.parse('-s abc -s def')
                    assert.equal(result.opts.s, 'def')
                })
                it('works with quoted strings with spaces', () => {
                    const result = basicOptions.parse('-s "hello, world!"')
                    assert.equal(result.opts.s, 'hello, world!')
                })
            })
        })
        describe('commands', () => {

        })
        describe('defaults', () => {

        })
    })
    // helper methods
})
