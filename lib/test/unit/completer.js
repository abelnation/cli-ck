
var assert = require('chai').assert

var cli

describe('Completer', function() {
    beforeEach(function() {
        cli = require('../fixtures/basic-completion')
    })
    describe('tab-completes', function() {
        describe('commands', function() {
            it('returns all commands for empty string', function() {
                var line = ''
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getCommandNames())
            })
            it('returns all commands matching partial string', function() {
                var line = 'f'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ 'foo', 'foobar', 'foobaz' ])
            })
            it('returns all commands matching partial string', function() {
                var line = 'foo'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ 'foo', 'foobar', 'foobaz' ])
            })
        })
        describe('option names', function() {
            it('returns all options matching partial string', function() {
                var line = '--a'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ '--aaa', '--abb' ])
            })
            it('returns all option names when completing "--"', function() {
                var line = '--a'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    [ '--aaa', '--abb' ])
            })
            it('returns all option names when completing "-" with no option flags', function() {
                var line = '-'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getOptionNames().map(function(x) { return '--' + x }))
            })
            it('returns all option names when completing "--" with no chars following', function() {
                var line = '--'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, line)
                assert.deepEqual(
                    result.completions,
                    cli.getOptionNames().map(function(x) { return '--' + x }))
            })
            it('after command, auto-completes options for the command only', function() {
                var line = 'foo --x'
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, '--x')
                assert.deepEqual(
                    result.completions,
                    [ '--xxx', '--xyy', '--xyz' ])
            })
        })
        describe('option values for options with choices', function() {
            it ('completes with command names after option with no choices', function() {
                var line = '--aaa '
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, '')
                assert.deepEqual(
                    result.completions,
                    cli.getCommandNames())
            })
            it('completes with option choices after option with choices', function() {
                var line = '--fruit '
                var result = cli.complete(line)
                assert.equal(result.tokenToComplete, '')
                assert.deepEqual(
                    result.completions,
                    cli.options['fruit'].getChoices())
            })
        })
    })
})
