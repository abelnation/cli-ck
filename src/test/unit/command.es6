require('babel-polyfill')
const assert = require('chai').assert

const Click = require('../../cli-ck')
const Command = require('../../command')

let parent
describe('Command', () => {
    beforeEach(() => {
        parent = new Click()
    })
    describe('constructor', () => {
        it('requires name', () => {
            assert.throws(() => {
                new Command()
            })
        })
        it('sets name', () => {
            const name = 'test'
            const cmd = new Command(name, {}, parent)
            assert.equal(cmd.getName(), name)
        })
        it('name may not begin with "_"', () => {
            assert.throws(() => {
                new Command('_test', {}, parent)
            })
        })
        describe('config', () => {
            it('can be undefined', () => {
                assert.doesNotThrow(() => {
                    new Command('test', undefined, parent)
                })
            })
            it('sets description', () => {
                const desc = 'test desc'
                const cmd = new Command('test', { description: desc }, parent)
                assert.equal(cmd.getDescription(), desc)
            })
        })
        describe('parentContext', () => {
            it('requires parent context', () => {
                assert.throws(() => {
                    new Command('test', {})
                })
            })
            it('requires parent context to be Click instance', () => {
                assert.throws(() => {
                    new Command('test', {}, {})
                })
            })
        })
        describe('setupContext', () => {
            it('can be undefined', () => {
                const cmd = new Command('test', {}, parent)
                assert.equal(cmd.context.constructor, Click)
            })
            it('can be a function', () => {
                const cmd = new Command('test', {}, parent, context => {
                    context.option('f')
                })
                assert.equal(cmd.context.constructor, Click)
            })
            it('can be an instance of Click', () => {
                const context = (new Click()).option('f')
                const cmd = new Command('test', {}, parent, context)
                assert.equal(cmd.context, context)
                assert.equal(cmd.context.constructor, Click)
            })
            it('inherits version from parent', () => {
                const version = '1.2.3'
                parent.version(version)
                const cmd = new Command('test', {}, parent)
                assert.equal(cmd.getContext().getVersion(), version)
            })
            it('inherits name with command name appended', () => {
                const name = 'test'
                const cmdName = 'foo'
                parent.name(name)
                const cmd = new Command(cmdName, {}, parent)
                assert.equal(cmd.getContext().getName(), `${ name } ${ cmdName }`)
            })
            it('does not modify name of parent', () => {
                const name = 'test'
                const cmdName = 'foo'
                parent.name(name)
                const cmd = new Command(cmdName, {}, parent)
                assert.equal(cmd.getContext().getName(), `${ name } ${ cmdName }`)
                assert.equal(parent.getName(), name)
            })
            it('takes description from config', () => {
                const desc = 'test description'
                const cmd = new Command('test', { desc: desc }, parent)
                assert.equal(cmd.getContext().getDescription(), desc)
            })
        })
    })
})
