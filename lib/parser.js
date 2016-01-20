'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var ArgConsumer = require('./arg-consumer');
var shellParse = require('shell-quote').parse;

var Parser = function () {
    function Parser(context) {
        _classCallCheck(this, Parser);

        this.context = context;
    }

    _createClass(Parser, [{
        key: 'parse',
        value: function parse(argv, cb) {
            // argv can be a string, an array, or an ArgConsumer
            // regardless, we ensure argv ends up as an ArgConsumer
            argv = ArgConsumer.cleanArgv(argv);

            var lastContext = this.context;
            var result = {
                args: [],
                opts: {},
                command: '',
                context: this.context
            };

            // parse args, relying on helpers to parse different arg types
            while (argv.hasNext()) {
                // peek at first to help determine type of arg
                var next = argv.peek();

                if (/^--$/.test(next)) {
                    // When '--' is encountered, stop analyzing and push rest of args
                    // on to _ arg array
                    argv.next();
                    result.args = result.args.concat(argv.next(argv.numRemaining()));
                } else if (/^--/.test(next)) {
                    this.consumeLongFormOption(next, argv, result);
                } else if (/^-/.test(next)) {
                    // ArgConsumer ensures all short options are split apart
                    // so we can safely consume an arg once per short option
                    this.consumeShortFormOption(next, argv, result);
                } else if (next in this.context.commands) {
                    // let sub-command parse the rest, and merge results
                    var cmdParseResult = this.consumeCommand(next, argv, result);
                    lastContext = cmdParseResult.lastContext;
                    this.mergeResults(result, cmdParseResult);
                } else {
                    this.consumeArg(next, argv, result);
                }
            }

            // assign default values
            this.fillInDefaults(result);

            result.lastContext = lastContext;
            result.argv = argv;

            if (cb) {
                return cb(null, result);
            } else {
                return result;
            }
        }

        // helper methods

    }, {
        key: 'consumeLongFormOption',
        value: function consumeLongFormOption(arg, argv, result) {
            var optionName = arg.replace(/^--/, '');
            if (/^--.*=.*/.test(arg)) {
                var _optionName$split = optionName.split('=');

                var _optionName$split2 = _slicedToArray(_optionName$split, 2);

                var _name = _optionName$split2[0];
                var value = _optionName$split2[1];

                this.consumeExplicitSetOptionValue(_name, value, argv, result);
                argv.next();
            } else {
                var _optionName = arg.replace(/^--/, '');
                this.consumeOption(_optionName, argv, result);
            }
        }
    }, {
        key: 'consumeShortFormOption',
        value: function consumeShortFormOption(arg, argv, result) {
            var optionName = arg.replace(/^-/, '');
            this.consumeOption(optionName, argv, result);
        }

        // e.g. '--foo=bar --baz=false

    }, {
        key: 'consumeExplicitSetOptionValue',
        value: function consumeExplicitSetOptionValue(optionName, value, argv, result) {
            if (optionName in this.context.options) {
                var opt = this.context.options[optionName];
                if (opt.isBoolean()) {
                    this.setBooleanOptionValue(result, optionName, value);
                } else if (opt.isCount()) {
                    // can explicitly set count value
                    this.setNumberOptionValue(result, optionName, value);
                } else if (opt.isString()) {
                    this.setStringOptionValue(result, optionName, value);
                } else if (opt.isNumber()) {
                    this.setNumberOptionValue(result, optionName, value);
                }
            } else {
                this.setStringOptionValue(result, name, value);
            }
        }
    }, {
        key: 'consumeOption',
        value: function consumeOption(optionName, argv, result) {
            if (optionName in this.context.options) {
                var opt = this.context.options[optionName];
                if (opt.isBoolean()) {
                    this.consumeBoolean(optionName, argv, result);
                } else if (opt.isCount()) {
                    this.consumeCount(optionName, argv, result);
                } else if (opt.isString()) {
                    this.consumeString(optionName, argv, result);
                } else if (opt.isNumber()) {
                    this.consumeNumber(optionName, argv, result);
                }
            } else {
                this.consumeBoolean(optionName, argv, result);
            }
        }
    }, {
        key: 'consumeCommand',
        value: function consumeCommand(commandName, argv, result) {
            if (!result.command) {
                result.command = commandName;
            } else {
                result.command += Parser.COMMAND_DELIM + commandName;
            }

            argv.next();

            var cmd = this.context.commands[commandName];
            return new Parser(cmd.context).parse(argv);
        }
    }, {
        key: 'consumeArg',
        value: function consumeArg(arg, argv, result) {
            // add to args
            this.addArg(result, arg);
            argv.next();
        }
    }, {
        key: 'consumeNumber',
        value: function consumeNumber(optionName, argv, result) {
            var value = argv.peek(2)[1];
            if (!/^--/.test(value)) {
                this.setNumberOptionValue(result, optionName, value);
                argv.next(2);
            } else {
                argv.next();
            }
        }
    }, {
        key: 'consumeCount',
        value: function consumeCount(optionName, argv, result) {
            this.incrementCountOptionValue(result, optionName);
            argv.next();
        }
    }, {
        key: 'consumeString',
        value: function consumeString(optionName, argv, result) {
            var value = argv.peek(2)[1];
            if (!/^--/.test(value)) {
                this.setStringOptionValue(result, optionName, value);
                argv.next(2);
            } else {
                argv.next();
            }
        }
    }, {
        key: 'consumeBoolean',
        value: function consumeBoolean(optionName, argv, result) {
            this.setBooleanOptionValue(result, optionName, true);
            argv.next();
        }
    }, {
        key: 'addArg',
        value: function addArg(result, arg) {
            result.args.push(arg);
        }
    }, {
        key: 'setOptionValueForAllAliases',
        value: function setOptionValueForAllAliases(result, name, value) {
            if (name in this.context.options) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.context.options[name].getAliases()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var alias = _step.value;

                        result.opts[alias] = value;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            } else {
                result.opts[name] = value;
            }
        }
    }, {
        key: 'setBooleanOptionValue',
        value: function setBooleanOptionValue(result, name, value) {
            var trueRe = new RegExp('1|yes|y|t|true', 'i');
            var boolVal = trueRe.test(value);
            this.setOptionValueForAllAliases(result, name, boolVal);
        }
    }, {
        key: 'setStringOptionValue',
        value: function setStringOptionValue(result, name, value) {
            this.setOptionValueForAllAliases(result, name, value);
        }
    }, {
        key: 'incrementCountOptionValue',
        value: function incrementCountOptionValue(result, name) {
            var newValue = undefined;
            if (name in result.opts) {
                newValue = result.opts[name] + 1;
            } else {
                newValue = 1;
            }

            this.setOptionValueForAllAliases(result, name, newValue);
        }
    }, {
        key: 'setNumberOptionValue',
        value: function setNumberOptionValue(result, name, value) {
            var numVal = parseFloat(value);
            if (isNaN(numVal)) {
                return;
            }
            this.setOptionValueForAllAliases(result, name, numVal);
        }
    }, {
        key: 'fillInDefaults',
        value: function fillInDefaults(result) {
            // fill in provided defaultValues
            for (var optName in this.context.optDefaults) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.context.options[optName].getAliases()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var alias = _step2.value;

                        if (typeof result.opts[alias] === 'undefined') {
                            result.opts[alias] = this.context.options[alias].defaultValue;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            // counts without defaultValue should default to 0
            for (var optName in this.context.options) {
                var opt = this.context.options[optName];
                if (opt.isCount() && typeof result.opts[optName] === 'undefined') {
                    result.opts[optName] = 0;
                }
            }

            // booleans without defaultValue should default to false
            for (var optName in this.context.options) {
                var opt = this.context.options[optName];
                if (opt.isBoolean() && typeof result.opts[optName] === 'undefined') {
                    result.opts[optName] = false;
                }
            }
        }
    }, {
        key: 'mergeResults',
        value: function mergeResults(result, subresult) {
            // merge result with sub-command result
            if (!result) {
                throw new Error('result is null');
            }
            if (!subresult) {
                throw new Error('subresult is null');
            }

            // args
            result.args = result.args.concat(subresult.args);

            // opts
            for (var key in subresult.opts) {
                result.opts[key] = subresult.opts[key];
            }

            // command
            if (subresult.command) {
                result.command = result.command + Parser.COMMAND_DELIM + subresult.command;
            }

            // argv not changed
        }
    }]);

    return Parser;
}();

Parser.COMMAND_DELIM = ' ';

module.exports = Parser;
//# sourceMappingURL=parser.js.map