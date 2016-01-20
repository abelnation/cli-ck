require('babel-polyfill')
const assert = require('chai').assert

const Click = require('../../cli-ck')
const Parser = require('../../parser')

describe('Validator', () => {
    describe('.validate', () => {
        describe('choices', () => {
            let cli
            before(() => {
                cli = new Click().option('fruit', {
                    string: true,
                    choices: [ 'apple', 'banana', 'pear', 'plumb' ],
                    defaultValue: 'apple'
                })
                .command('foo', {},
                    new Click()
                        .option('choice', { choices: [ 'a', 'b', 'c' ]}))
            })
            it('does not complain if not provided', () => {
                assert.isTrue(cli.validate(''))
            })
            it('valid if choice is valid', () => {
                assert.isTrue(cli.validate('--fruit apple'))
            })
            it('throws if choice is invalid', () => {
                assert.throws(() => {
                    cli.validate('--fruit invalid')
                })
            })
            it('works within subcommand', () => {
                assert.throws(() => {
                    cli.validate('foo --choice invalid')
                })
            })
        })
        describe('num args', () => {
            let cli
            before(() => {
                cli = new Click().nargs(2,3)
            })
            it('does not complain if nargs within bounds', () => {
                assert.isTrue(cli.validate('a b'))
                assert.isTrue(cli.validate('a b c'))
                assert.isTrue(cli.validate('--foo a --bar b c -xyz'))
            })
            it('throws if nargs out of range', () => {
                assert.throws(() => { cli.validate('a') })
                assert.throws(() => { cli.validate('a b c d') })
                assert.throws(() => { cli.validate('-foo --bar a') })
            })
        })
        describe('required options', () => {
            let cli
            before(() => {
                cli = new Click()
                    .option('a', { required: true })
                    .option('b')
            })
            it('does not complain if required args provided', () => {
                assert.isTrue(cli.validate('--a test --b'))
            })
            it('throws if required arg not provided', () => {
                assert.throws(() => {
                    cli.validate('--b')
                })
            })
            it('throws if opt name but no value provided', () => {
                assert.throws(() => {
                    cli.validate('--a --b')
                })
            })
        })
    })
})
