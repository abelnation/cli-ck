require('babel-polyfill')
const assert = require('chai').assert

const yargs = require('../../cli-ck')
const Option = require('../../option')

describe('Option', () => {
    describe('constructor', () => {
        it('sets name', () => {
            const name = 'test'
            const config = {}
            const opt = new Option(name, config)

            assert.equal(opt.getName(), name)
        })

        it('names may not begin with "_"', () => {
            assert.throws(() => {
                new Option('_test')
            })
        })

        it('requires name', () => {
            assert.throws(() => {
                const opt = new Option()
            })
        })

        describe('config', () => {
            it('does not require a config object', () => {
                assert.doesNotThrow(() => {
                    new Option('test')
                })
            })

            describe('description', () => {
                it('defaults to undefined', () => {
                    const opt = new Option('test')
                    assert.isUndefined(opt.getDescription())
                })
                it('sets properly with "description"', () => {
                    const testDesc = 'test description'
                    const opt = new Option('test', { description: testDesc })
                    assert.equal(opt.getDescription(), testDesc)
                })
                it('sets properly with "desc"', () => {
                    const testDesc = 'test description'
                    const opt = new Option('test', { desc: testDesc })
                    assert.equal(opt.getDescription(), testDesc)
                })
                it('sets properly with "describe"', () => {
                    const testDesc = 'test description'
                    const opt = new Option('test', { describe: testDesc })
                    assert.equal(opt.getDescription(), testDesc)
                })
            })

            describe('required', () => {
                it('defaults to false', () => {
                    const opt = new Option('test')
                    assert.isFalse(opt.isRequired())
                })
                it('sets required with "demand"', () => {
                    const opt = new Option('test', { demand: true })
                    assert.isTrue(opt.isRequired())
                })
                it('sets required with "required"', () => {
                    const opt = new Option('test', { required: true })
                    assert.isTrue(opt.isRequired())
                })
                it('sets not required with false value', () => {
                    const opt1 = new Option('test', { required: false })
                    const opt2 = new Option('test', { demand: false })
                    assert.isFalse(opt1.isRequired())
                    assert.isFalse(opt2.isRequired())
                })
                it('required opts default to string instead of boolean', () => {
                    const opt = new Option('test', { required: true })
                    assert.equal(opt.getType(), Option.Type.String)
                })
                it('required opts cannot be count or explicit boolean', () => {
                    assert.throws(() => { new Option('test', { required: true, count: true }) })
                    assert.throws(() => { new Option('test', { required: true, boolean: true }) })
                })
            })

            describe('aliases', () => {
                it('defaults to array with just name', () => {
                    const name = 'test'
                    const opt = new Option(name)
                    assert.deepEqual(opt.getAliases(), [ name ])
                })

                it('takes a single string value', () => {
                    const name = 'test'
                    const alias = 'testalias'
                    const opt = new Option(name, { alias: alias })
                    assert.deepEqual(opt.getAliases(), [ name, alias ])
                })

                it('takes an array of strings', () => {
                    const name = 'test'
                    const alias = [ 'alias1', 'alias2', 'alias3' ]
                    const opt = new Option(name, { alias: alias })
                    assert.deepEqual(opt.getAliases(), [ name, ... alias ])
                })
            })

            describe('choices', () => {
                it('defaults to undefined', () => {
                    const opt = new Option('test')
                    assert.isFalse(opt.hasChoices())
                    assert.isUndefined(opt.getChoices())
                })
                it('takes an array of values', () => {
                    const choices = [ 'a', 'b', 'c' ]
                    const opt = new Option('test', { choices: choices })
                    assert.deepEqual(opt.getChoices(), choices)
                })
                it('takes a function that evaluates to a list of choices', () => {
                    const choices = [ 'a', 'b', 'c' ]
                    const choicesFn = () => {
                        return choices
                    }
                    const opt = new Option('test', { choices: choicesFn })
                    assert.deepEqual(opt.getChoices(), choices)
                })
            })

            describe('defaultValue', () => {
                it('defaults to undefined', () => {
                    const opt = new Option('test')
                    assert.isFalse(opt.hasDefaultValue())
                    assert.isUndefined(opt.getDefaultValue())
                })
                it('takes value', () => {
                    const defaultValue = 'default'
                    const opt = new Option('test', { defaultValue: defaultValue })
                    assert.isTrue(opt.hasDefaultValue())
                    assert.equal(opt.getDefaultValue(), defaultValue)
                })
            })

            describe('type', () => {
                it('defaults to boolean', () => {
                    const opt = new Option('test')
                    assert.equal(opt.getType(), Option.Type.Boolean)
                })
                it('can be set to boolean explicitly', () => {
                    const opt1 = new Option('test', { boolean: true })
                    const opt2 = new Option('test', { type: Option.Type.Boolean })
                    assert.equal(opt1.getType(), Option.Type.Boolean)
                    assert.equal(opt2.getType(), Option.Type.Boolean)
                })
                it('can be set to count explicitly', () => {
                    const opt1 = new Option('test', { count: true })
                    const opt2 = new Option('test', { type: Option.Type.Count })
                    assert.equal(opt1.getType(), Option.Type.Count)
                    assert.equal(opt2.getType(), Option.Type.Count)
                })
                it('can be set to number explicitly', () => {
                    const opt1 = new Option('test', { number: true })
                    const opt2 = new Option('test', { type: Option.Type.Number })
                    assert.equal(opt1.getType(), Option.Type.Number)
                    assert.equal(opt2.getType(), Option.Type.Number)
                })
                it('can be set to string explicitly', () => {
                    const opt1 = new Option('test', { string: true })
                    const opt2 = new Option('test', { type: Option.Type.String })
                    assert.equal(opt1.getType(), Option.Type.String)
                    assert.equal(opt2.getType(), Option.Type.String)
                })
            })
        })
    })
})
