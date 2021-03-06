
var assert = require('chai').assert

var Click = require('../../cli-ck')
var Command = require('../../command')

var parent
describe('Command', function() {
    beforeEach(function() {
        parent = new Click()
    })
    describe('constructor', function() {
        it('requires name', function() {
            assert.throws(function() {
                new Command()
            })
        })
        it('sets name', function() {
            var name = 'test'
            var cmd = new Command(name, parent)
            assert.equal(cmd.getName(), name)
        })
        it('name may not begin with "_"', function() {
            assert.throws(function() {
                new Command('_test', parent)
            })
        })
        describe('parentContext', function() {
            it('requires parent context', function() {
                assert.throws(function() {
                    new Command('test', {})
                })
            })
            it('requires parent context to be Click instance', function() {
                assert.throws(function() {
                    new Command('test', {})
                })
            })
        })
        describe('setupContext', function() {
            it('can be undefined', function() {
                var cmd = new Command('test', parent)
                assert.equal(cmd.context.constructor, Click)
            })
            it('can be a function', function() {
                var cmd = new Command('test', parent, function(context) {
                    context.option('f')
                })
                assert.equal(cmd.context.constructor, Click)
            })
            it('can be an instance of Click', function() {
                var context = (new Click()).option('f')
                var cmd = new Command('test', parent, context)
                assert.equal(cmd.context, context)
                assert.equal(cmd.context.constructor, Click)
            })
            it('inherits version from parent', function() {
                var version = '1.2.3'
                parent.version(version)
                var cmd = new Command('test', parent)
                assert.equal(cmd.getContext().getVersion(), version)
            })
            it('parent contexts name is set to the command name', function() {
                var name = 'test'
                var cmdName = 'foo'
                parent.name(name)
                var cmd = new Command(cmdName, parent)
                assert.equal(cmd.getContext().getName(), cmdName)
            })
            it('takes description from setupContext', function() {
                var desc = 'test description'
                var setupContext = new Click().description(desc)
                var cmd = new Command('test', parent, setupContext)
                assert.equal(cmd.getDescription(), desc)
            })
        })
    })
})
