'use strict';

require('babel-polyfill');
var assert = require('chai').assert;

var yargs = require('../../cli-ck');
var Option = require('../../option');

describe('Option', function () {
    describe('constructor', function () {
        it('sets name', function () {
            var name = 'test';
            var config = {};
            var opt = new Option(name, config);

            assert.equal(opt.getName(), name);
        });

        it('names may not begin with "_"', function () {
            assert.throws(function () {
                new Option('_test');
            });
        });

        it('requires name', function () {
            assert.throws(function () {
                var opt = new Option();
            });
        });

        describe('config', function () {
            it('does not require a config object', function () {
                assert.doesNotThrow(function () {
                    new Option('test');
                });
            });

            describe('description', function () {
                it('defaults to undefined', function () {
                    var opt = new Option('test');
                    assert.isUndefined(opt.getDescription());
                });
                it('sets properly with "description"', function () {
                    var testDesc = 'test description';
                    var opt = new Option('test', { description: testDesc });
                    assert.equal(opt.getDescription(), testDesc);
                });
                it('sets properly with "desc"', function () {
                    var testDesc = 'test description';
                    var opt = new Option('test', { desc: testDesc });
                    assert.equal(opt.getDescription(), testDesc);
                });
                it('sets properly with "describe"', function () {
                    var testDesc = 'test description';
                    var opt = new Option('test', { describe: testDesc });
                    assert.equal(opt.getDescription(), testDesc);
                });
            });

            describe('required', function () {
                it('defaults to false', function () {
                    var opt = new Option('test');
                    assert.isFalse(opt.isRequired());
                });
                it('sets required with "demand"', function () {
                    var opt = new Option('test', { demand: true });
                    assert.isTrue(opt.isRequired());
                });
                it('sets required with "required"', function () {
                    var opt = new Option('test', { required: true });
                    assert.isTrue(opt.isRequired());
                });
                it('sets not required with false value', function () {
                    var opt1 = new Option('test', { required: false });
                    var opt2 = new Option('test', { demand: false });
                    assert.isFalse(opt1.isRequired());
                    assert.isFalse(opt2.isRequired());
                });
                it('required opts default to string instead of boolean', function () {
                    var opt = new Option('test', { required: true });
                    assert.equal(opt.getType(), Option.Type.String);
                });
                it('required opts cannot be count or explicit boolean', function () {
                    assert.throws(function () {
                        new Option('test', { required: true, count: true });
                    });
                    assert.throws(function () {
                        new Option('test', { required: true, boolean: true });
                    });
                });
            });

            describe('aliases', function () {
                it('defaults to array with just name', function () {
                    var name = 'test';
                    var opt = new Option(name);
                    assert.deepEqual(opt.getAliases(), [name]);
                });

                it('takes a single string value', function () {
                    var name = 'test';
                    var alias = 'testalias';
                    var opt = new Option(name, { alias: alias });
                    assert.deepEqual(opt.getAliases(), [name, alias]);
                });

                it('takes an array of strings', function () {
                    var name = 'test';
                    var alias = ['alias1', 'alias2', 'alias3'];
                    var opt = new Option(name, { alias: alias });
                    assert.deepEqual(opt.getAliases(), [name].concat(alias));
                });
            });

            describe('choices', function () {
                it('defaults to undefined', function () {
                    var opt = new Option('test');
                    assert.isFalse(opt.hasChoices());
                    assert.isUndefined(opt.getChoices());
                });
                it('takes an array of values', function () {
                    var choices = ['a', 'b', 'c'];
                    var opt = new Option('test', { choices: choices });
                    assert.deepEqual(opt.getChoices(), choices);
                });
                it('takes a function that evaluates to a list of choices', function () {
                    var choices = ['a', 'b', 'c'];
                    var choicesFn = function choicesFn() {
                        return choices;
                    };
                    var opt = new Option('test', { choices: choicesFn });
                    assert.deepEqual(opt.getChoices(), choices);
                });
            });

            describe('defaultValue', function () {
                it('defaults to undefined', function () {
                    var opt = new Option('test');
                    assert.isFalse(opt.hasDefaultValue());
                    assert.isUndefined(opt.getDefaultValue());
                });
                it('takes value', function () {
                    var defaultValue = 'default';
                    var opt = new Option('test', { defaultValue: defaultValue });
                    assert.isTrue(opt.hasDefaultValue());
                    assert.equal(opt.getDefaultValue(), defaultValue);
                });
            });

            describe('type', function () {
                it('defaults to boolean', function () {
                    var opt = new Option('test');
                    assert.equal(opt.getType(), Option.Type.Boolean);
                });
                it('can be set to boolean explicitly', function () {
                    var opt1 = new Option('test', { boolean: true });
                    var opt2 = new Option('test', { type: Option.Type.Boolean });
                    assert.equal(opt1.getType(), Option.Type.Boolean);
                    assert.equal(opt2.getType(), Option.Type.Boolean);
                });
                it('can be set to count explicitly', function () {
                    var opt1 = new Option('test', { count: true });
                    var opt2 = new Option('test', { type: Option.Type.Count });
                    assert.equal(opt1.getType(), Option.Type.Count);
                    assert.equal(opt2.getType(), Option.Type.Count);
                });
                it('can be set to number explicitly', function () {
                    var opt1 = new Option('test', { number: true });
                    var opt2 = new Option('test', { type: Option.Type.Number });
                    assert.equal(opt1.getType(), Option.Type.Number);
                    assert.equal(opt2.getType(), Option.Type.Number);
                });
                it('can be set to string explicitly', function () {
                    var opt1 = new Option('test', { string: true });
                    var opt2 = new Option('test', { type: Option.Type.String });
                    assert.equal(opt1.getType(), Option.Type.String);
                    assert.equal(opt2.getType(), Option.Type.String);
                });
            });
        });
    });
});
//# sourceMappingURL=option.js.map