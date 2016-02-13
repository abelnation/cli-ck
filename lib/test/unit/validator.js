
var assert = require('chai').assert

var Click = require('../../cli-ck')

describe('Validator', function() {
    describe('.validate', function() {
        describe('choices', function() {
            var cli
            before(function() {
                cli = new Click().option('fruit', {
                    string: true,
                    choices: [ 'apple', 'banana', 'pear', 'plumb' ],
                    defaultValue: 'apple'
                })
                .command('foo', new Click()
                        .option('choice', { choices: [ 'a', 'b', 'c' ]}))
            })
            it('does not complain if not provided', function() {
                assert.isTrue(cli.validate(''))
            })
            it('valid if choice is valid', function() {
                assert.isTrue(cli.validate('--fruit apple'))
            })
            it('throws if choice is invalid', function() {
                assert.throws(function() {
                    cli.validate('--fruit invalid')
                })
            })
            it('works within subcommand', function() {
                assert.throws(function() {
                    cli.validate('foo --choice invalid')
                })
            })
        })
        describe('num args', function() {
            var cli
            before(function() {
                cli = new Click().nargs(2,3)
            })
            it('does not complain if nargs within bounds', function() {
                assert.isTrue(cli.validate('a b'))
                assert.isTrue(cli.validate('a b c'))
                assert.isTrue(cli.validate('--foo a --bar b c -xyz'))
            })
            it('throws if nargs out of range', function() {
                assert.throws(function() { cli.validate('a') })
                assert.throws(function() { cli.validate('a b c d') })
                assert.throws(function() { cli.validate('-foo --bar a') })
            })
        })
        describe('required options', function() {
            var cli
            before(function() {
                cli = new Click()
                    .option('a', { required: true })
                    .option('b')
            })
            it('does not complain if required args provided', function() {
                assert.isTrue(cli.validate('--a test --b'))
            })
            it('throws if required opt not provided', function() {
                assert.throws(function() {
                    cli.validate('--b')
                })
            })
            it('throws if opt name but no value provided', function() {
                assert.throws(function() {
                    cli.validate('--a --b')
                })
            })
        })
    })
})
