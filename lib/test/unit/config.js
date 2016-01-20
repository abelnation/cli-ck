'use strict';

require('babel-polyfill');
var assert = require('chai').assert;

var Click = require('../../cli-ck');

describe('yargs config', function () {
    describe('.name', function () {
        it('defaults to name of executing script from cli', function () {
            var result = new Click();
            // tests run with _mocha executable
            assert.equal(result.getName(), '_mocha');
        });
        it('can override the default', function () {
            var result = new Click().name('test');
            // tests run with _mocha executable
            assert.equal(result.getName(), 'test');
        });
    });
    describe('.version', function () {
        it('defaults to undefined', function () {
            var result = new Click();
            assert.isUndefined(result.getVersion());
        });

        it('sets config.version', function () {
            var version = '1.0.0';
            var result = new Click().version(version);
            assert.equal(result.getVersion(), version);
        });
    });

    describe('.usage', function () {
        it('defaults to undefined', function () {
            var result = new Click();
            assert.isUndefined(result.getUsage());
        });

        it('sets config.usage', function () {
            var usage = 'test usage';
            var result = new Click().usage(usage);
            assert.equal(result.getUsage(), usage);
        });
    });

    describe('.nargs', function () {
        it('defaults min/max to undefined', function () {
            var result = new Click();
            assert.isUndefined(result.getMinArgs());
            assert.isUndefined(result.getMaxArgs());
        });

        it('setting single value', function () {
            var nargs = 5;
            var result = new Click().nargs(nargs);
            assert.equal(result.getMinArgs(), nargs);
            assert.equal(result.getMinArgs(), nargs);
        });

        it('setting just min value', function () {
            var min = 5;
            var max = -1;
            var result = new Click().nargs(min, max);
            assert.equal(result.getMinArgs(), min);
            assert.isUndefined(result.getMaxArgs());
        });

        it('setting just max value', function () {
            var min = -1;
            var max = 10;
            var result = new Click().nargs(min, max);
            assert.isUndefined(result.getMinArgs());
            assert.equal(result.getMaxArgs(), max);
        });

        it('setting both', function () {
            var min = 5;
            var max = 10;
            var result = new Click().nargs(min, max);
            assert.equal(result.getMinArgs(), min);
            assert.equal(result.getMaxArgs(), max);
        });

        it('error when setting min greater than max', function () {
            assert.throws(function () {
                var min = 1000;
                var max = 10;
                new Click().nargs(min, max);
            });
        });

        it('error when no args', function () {
            assert.throws(function () {
                new Click().nargs();
            });
        });
    });

    describe('.option', function () {});

    describe('.optionSet', function () {});

    describe('.command', function () {});

    describe('.handler', function () {
        it('defaults to undefined', function () {
            var result = new Click();
            assert.isUndefined(result.getHandler());
        });
        it('sets value', function () {
            var handler = function handler() {
                console.log('hi');
            };
            var result = new Click();
            result.handler(handler);
            assert.equal(result.getHandler(), handler);
        });
    });
});
//# sourceMappingURL=config.js.map