'use strict';

require('babel-polyfill');
var assert = require('chai').assert;

var Click = require('../../cli-ck');
var Parser = require('../../parser');

var basicOptions = require('../fixtures/basic-options');

describe('Parser', function () {
    describe('parse', function () {
        describe('arguments', function () {});
        describe('long-form options', function () {
            describe('booleans', function () {
                it('absence of option sets value to false', function () {
                    var result = basicOptions.parse('');
                    assert.isFalse(result.opts['ex-boolean']);
                });
                it('presence of option sets value to true', function () {
                    var result = basicOptions.parse('--ex-boolean');
                    assert.isTrue(result.opts['ex-boolean']);
                });
                it('can be explicitly set to false using "=" syntax', function () {
                    var result = basicOptions.parse('--ex-boolean=false');
                    assert.isFalse(result.opts['ex-boolean']);
                });
                it('can be explicitly set to true using "=" syntax', function () {
                    var result = basicOptions.parse('--ex-boolean=true');
                    assert.isTrue(result.opts['ex-boolean']);
                });
                it('sets for aliases', function () {
                    var result = basicOptions.parse('--ex-boolean');
                    assert.isTrue(result.opts['ex-boolean']);
                    assert.isTrue(result.opts['b']);
                });
            });

            describe('counts', function () {
                it('defaults to 0', function () {
                    var result = basicOptions.parse('');
                    assert.isDefined(result.opts['ex-count']);
                    assert.equal(result.opts['ex-count'], 0);
                });
                it('counts num of args provided', function () {
                    assert.equal(basicOptions.parse('').opts['ex-count'], 0);
                    assert.equal(basicOptions.parse('--ex-count').opts['ex-count'], 1);
                    assert.equal(basicOptions.parse('--ex-count a --ex-count b --foo').opts['ex-count'], 2);
                    assert.equal(basicOptions.parse('--ex-count --ex-count b c --ex-count').opts['ex-count'], 3);
                });
                it('can set count explicitly', function () {
                    assert.equal(basicOptions.parse('--ex-count=2').opts['ex-count'], 2);
                    assert.equal(basicOptions.parse('--ex-count=3').opts['ex-count'], 3);
                });
                it('presence of option restarts at 0 instead of defaultValue', function () {
                    var parser = new Click();
                    parser.option('cdef', {
                        alias: 'c',
                        count: true,
                        defaultValue: 3
                    });
                    assert.equal(parser.parse('').opts['cdef'], 3);
                    assert.equal(parser.parse('--cdef').opts['cdef'], 1);
                    assert.equal(parser.parse('--cdef a --cdef b --foo').opts['cdef'], 2);
                    assert.equal(parser.parse('--cdef --cdef b c --cdef').opts['cdef'], 3);
                });
                it('sets for aliases', function () {
                    var result = basicOptions.parse('--ex-count');
                    assert.equal(result.opts['ex-count'], 1);
                    assert.equal(result.opts['c'], 1);
                });
            });

            describe('numbers', function () {
                it('defaults to undefined', function () {
                    var result = basicOptions.parse('');
                    assert.isUndefined(result.opts['ex-number']);
                });
                it('results in number type', function () {
                    var result = basicOptions.parse('--ex-number 123');
                    assert.isNumber(result.opts['ex-number']);
                    assert.equal(result.opts['ex-number'], 123);
                });
                it('parses floats', function () {
                    var result = basicOptions.parse('--ex-number 1.5');
                    assert.isNumber(result.opts['ex-number']);
                    assert.equal(result.opts['ex-number'], 1.5);
                });
                it('can be set with "=" syntax', function () {
                    var result = basicOptions.parse('--ex-number=1.5');
                    assert.isNumber(result.opts['ex-number']);
                    assert.equal(result.opts['ex-number'], 1.5);
                });
                it('sets for aliases', function () {
                    var result = basicOptions.parse('--ex-number=123');
                    assert.equal(result.opts['ex-number'], 123);
                    assert.equal(result.opts['n'], 123);
                });
            });

            describe('strings', function () {
                it('defaults to undefined', function () {
                    var result = basicOptions.parse('');
                    assert.isUndefined(result.opts['ex-string']);
                });
                it('results in string type', function () {
                    var result = basicOptions.parse('--ex-string abc');
                    assert.isString(result.opts['ex-string']);
                    assert.equal(result.opts['ex-string'], 'abc');
                });
                it('handles quoted strings with spaces', function () {
                    var result = basicOptions.parse('--ex-string "hello, world!"');
                    assert.isString(result.opts['ex-string']);
                    assert.equal(result.opts['ex-string'], 'hello, world!');
                });
                it('when quoted, can be set with "=" syntax', function () {
                    var result = basicOptions.parse('--ex-string="hello, world!"');
                    assert.isString(result.opts['ex-string']);
                    assert.equal(result.opts['ex-string'], 'hello, world!');
                });
                it('can be set with "=" syntax', function () {
                    var result = basicOptions.parse('--ex-string=hello');
                    assert.isString(result.opts['ex-string']);
                    assert.equal(result.opts['ex-string'], 'hello');
                });
                it('sets for aliases', function () {
                    var result = basicOptions.parse('--ex-string=abc');
                    assert.equal(result.opts['ex-string'], 'abc');
                    assert.equal(result.opts['s'], 'abc');
                });
            });
        });
        describe('short-form options', function () {
            describe('booleans', function () {
                it('when absent, defaults to false', function () {
                    var result = basicOptions.parse('');
                    assert.isBoolean(result.opts['ex-boolean']);
                    assert.isFalse(result.opts['ex-boolean']);
                });
                it('can be set by short flag', function () {
                    var result = basicOptions.parse('-b');
                    assert.isBoolean(result.opts['ex-boolean']);
                    assert.isTrue(result.opts['ex-boolean']);
                });
                it('is not set when absent from short flag group', function () {
                    var result = basicOptions.parse('-xyz');
                    assert.isBoolean(result.opts['ex-boolean']);
                    assert.isFalse(result.opts['ex-boolean']);
                });
                it('can be set by short flag group', function () {
                    var result = basicOptions.parse('-xybz');
                    assert.isBoolean(result.opts['ex-boolean']);
                    assert.isTrue(result.opts['ex-boolean']);
                });
            });

            describe('counts', function () {
                it('can be set by short flag', function () {
                    assert.equal(basicOptions.parse('-c').opts.c, 1);
                });
                it('multiple short flags add to value', function () {
                    assert.equal(basicOptions.parse('-cccc').opts.c, 4);
                });
                it('aggregating works when separated', function () {
                    assert.equal(basicOptions.parse('-cab -c -xyc --ex-count').opts.c, 4);
                });
            });

            describe('numbers', function () {
                it('can be set by short flag', function () {
                    assert.equal(basicOptions.parse('-n 123').opts.n, 123);
                });
                it('cannot be set with "=" syntax', function () {
                    assert.throws(function () {
                        result = basicOptions.parse('-n=123');
                    });
                });
                it('last value takes precedence', function () {
                    var result = basicOptions.parse('-n 123 -n 456');
                    assert.equal(result.opts.n, 456);
                });
            });

            describe('strings', function () {
                it('can be set by short flag', function () {
                    assert.equal(basicOptions.parse('-s hello').opts.s, 'hello');
                });
                it('cannot be set with "=" syntax', function () {
                    assert.throws(function () {
                        basicOptions.parse('-s=hello');
                    });
                });
                it('last value takes precedence', function () {
                    var result = basicOptions.parse('-s abc -s def');
                    assert.equal(result.opts.s, 'def');
                });
                it('works with quoted strings with spaces', function () {
                    var result = basicOptions.parse('-s "hello, world!"');
                    assert.equal(result.opts.s, 'hello, world!');
                });
            });
        });
        describe('commands', function () {});
        describe('defaults', function () {});
    });
    // helper methods
});
//# sourceMappingURL=parser.js.map