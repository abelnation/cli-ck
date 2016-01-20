require('babel-polyfill')
const assert = require('chai').assert

const Click = require('../../cli-ck')
const Parser = require('../../parser')

let cli

describe('Completer', () => {
    beforeEach(() => {
        cli = require('../fixtures/basic-completion')
    })
    describe('tab-completes', () => {
        describe('commands', () => {
            it('returns all commands for empty string', () => {
                const line = ''
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getCommandNames())
            })
            it('returns all commands matching partial string', () => {
                const line = 'f'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ 'foo', 'foobar', 'foobaz' ])
            })
            it('returns all commands matching partial string', () => {
                const line = 'foo'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ 'foo', 'foobar', 'foobaz' ])
            })
        })
        describe('option names', () => {
            it('returns all options matching partial string', () => {
                const line = '--a'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ '--aaa', '--abb' ])
            })
            it('returns all option names when completing "--"', () => {
                const line = '--a'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ '--aaa', '--abb' ])
            })
            it('returns all option names when completing "-" with no option flags', () => {
                const line = '-'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getOptionNames().map(x => `--${ x }`))
            })
            it('returns all option names when completing "--" with no chars following', () => {
                const line = '--'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getOptionNames().map(x => `--${ x }`))
            })
            it('after command, auto-completes options for the command only', () => {
                const line = 'foo --x'
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, '--x')
                assert.deepEqual(
                    result.completions,
                    [ '--xxx', '--xyy', '--xyz' ])
            })
        })
        describe('option values for options with choices', () => {
            it ('completes with command names after option with no choices', () => {
                const line = '--aaa '
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, '')
                assert.deepEqual(
                    result.completions,
                    cli.getCommandNames())
            })
            it('completes with option choices after option with choices', () => {
                const line = '--fruit '
                const result = cli.complete(line)
                assert.equal(result.tokenToComplete, '')
                assert.deepEqual(
                    result.completions,
                    cli.options['fruit'].getChoices())
            })
        })
    })
})
