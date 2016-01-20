'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var _repl = require('repl');
var path = require('path');
var ArgConsumer = require('./arg-consumer');
var Option = require('./option');
var Command = require('./command');
var Completer = require('./completer');
var Parser = require('./parser');
var Validator = require('./validator');
var Help = require("./help");

var ClickError = function (_Error) {
    _inherits(ClickError, _Error);

    function ClickError() {
        _classCallCheck(this, ClickError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ClickError).apply(this, arguments));
    }

    return ClickError;
}(Error);

var Click = function () {
    function Click(config) {
        _classCallCheck(this, Click);

        // options
        this.options = {};
        this.optDefaults = {};
        this.optNames = {};
        this.requiredOpts = {};

        // commands
        this.commands = {};

        // misc config
        this.config = {};

        // default name to top-level script name
        var mainPath = require.resolve(require.main.filename);
        if (mainPath) {
            var mainTokens = mainPath.split(path.sep);
            this.config.name = mainTokens[mainTokens.length - 1];
        }

        this.option('version', { alias: 'v', desc: 'print version' });
        this.option('help', { alias: ['h', 'H'], desc: 'print help' });

        var noHelp = config ? config.noHelp : false;
        if (!noHelp) {
            this.command('help', { description: 'print help' }, Help.getHelpCommandContext());
        }
    }

    // Main methods

    _createClass(Click, [{
        key: 'parse',
        value: function parse(argv, cb) {
            var parseResult = new Parser(this).parse(argv, cb);

            if (cb) {
                return cb(null, parseResult);
            } else {
                return parseResult;
            }
        }
    }, {
        key: 'run',
        value: function run(argv, cb) {
            argv = ArgConsumer.cleanArgv(argv);

            var parseResult = new Parser(this).parse(argv, cb);
            if (parseResult.opts.repl) {
                return this.repl(argv, cb);
            }

            try {
                var isValid = new Validator(this).validate(parseResult);
                if (!isValid) {
                    console.error('Error: Invalid input');
                    return;
                }
            } catch (e) {
                console.error('Error: ' + e.message);
                return;
            }

            var lastContext = parseResult.lastContext;
            var handler = lastContext.getHandler();

            if (handler && typeof handler === 'function') {
                var args = parseResult.args;
                var opts = parseResult.opts;

                if (opts.help) {
                    console.log(lastContext.getHelp());
                } else if (opts.version) {
                    console.log('Version: ' + this.config.version);
                } else {
                    handler(args, opts, argv.args, this, lastContext);
                }
            } else {
                console.log(lastContext.getHelp());
            }
        }
    }, {
        key: 'repl',
        value: function repl(argv, cb) {
            var _this2 = this;

            // start repl
            this.command('exit', { desc: 'exit the program' }, new Click().handler(function () {
                process.exit(0);
            }));

            var server = _repl.start({
                prompt: '> ',
                eval: function _eval(line, nodeContext, filename, callback) {
                    line = line.slice(1, -2);
                    _this2.run(line);
                    server.displayPrompt();
                }
            });

            // backup original complete fn
            server._complete = server.complete;

            // assign repl completion fn
            server.complete = Completer.getReplTabCompleteCallback(this);
        }
    }, {
        key: 'validate',
        value: function validate(line, cb) {
            return new Validator(this).validate(line);
        }
    }, {
        key: 'complete',
        value: function complete(line, cb) {
            return new Completer(this).getCompletions(line, cb);
        }

        // Configuration Methods

    }, {
        key: 'name',
        value: function name(_name) {
            this.config.name = _name;
            return this;
        }
    }, {
        key: 'description',
        value: function description(_description) {
            this.config.description = _description;
            return this;
        }
    }, {
        key: 'version',
        value: function version(_version) {
            this.config.version = _version;
            return this;
        }
    }, {
        key: 'usage',
        value: function usage(msg) {
            // msg may be a single string or an array of strings
            this.config.usage = msg;
            return this;
        }
    }, {
        key: 'nargs',
        value: function nargs(min, max) {
            if (typeof min !== 'undefined' && typeof max === 'undefined') {
                // single arg case
                if (min >= 0) {
                    this.nargsMin = min;
                    this.nargsMax = min;
                }
            } else if (typeof min !== 'undefined' && typeof max !== 'undefined') {
                // double arg case
                if (min >= 0) {
                    this.nargsMin = min;
                }
                if (max >= 0) {
                    if (max < min) {
                        throw new ClickError('max must be >= min');
                    }
                    this.nargsMax = max;
                }
            } else {
                throw new ClickError('no arguments provided');
            }

            return this;
        }
    }, {
        key: 'option',
        value: function option(name, config) {
            var opt = new Option(name, config);
            this.optNames[name] = opt;

            // Register config for all names
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = opt.getAliases()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var label = _step.value;

                    this.options[label] = opt;
                }

                // Register in other lookups
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

            if (opt.isRequired()) {
                this.requiredOpts[name] = true;
            }
            if (opt.hasDefaultValue()) {
                this.optDefaults[name] = true;
            }

            return this;
        }
    }, {
        key: 'optionSet',
        value: function optionSet(configs) {
            for (var key in configs) {
                var config = configs[key];
                this.option(key, config);
            }
            return this;
        }
    }, {
        key: 'command',
        value: function command(name, config, context) {
            var cmd = new Command(name, config, this, context);
            this.commands[name] = cmd;

            return this;
        }
    }, {
        key: 'handler',
        value: function handler(cb) {
            if (typeof cb !== 'function') {
                throw new ClickError('handler must be a function');
            }
            this.handlerFn = cb;

            return this;
        }

        // Getters

    }, {
        key: 'getName',
        value: function getName() {
            return this.config.name;
        }
    }, {
        key: 'getDescription',
        value: function getDescription() {
            return this.config.description;
        }
    }, {
        key: 'getVersion',
        value: function getVersion() {
            return this.config.version;
        }
    }, {
        key: 'getUsage',
        value: function getUsage() {
            return this.config.usage.replace(/\$((\{(NAME|0|PROG)\})|(NAME|0|PROG))/g, this.getName());
        }
    }, {
        key: 'getMinArgs',
        value: function getMinArgs() {
            return this.nargsMin;
        }
    }, {
        key: 'getMaxArgs',
        value: function getMaxArgs() {
            return this.nargsMax;
        }
    }, {
        key: 'getOptionNames',
        value: function getOptionNames() {
            return Object.keys(this.options);
        }
    }, {
        key: 'getRequiredOptions',
        value: function getRequiredOptions() {
            return this.requiredOpts;
        }
    }, {
        key: 'getCommandNames',
        value: function getCommandNames() {
            return Object.keys(this.commands);
        }
    }, {
        key: 'getCommand',
        value: function getCommand(command) {
            var context = this;
            var result = undefined;
            var commands = command.split(Parser.COMMAND_DELIM);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = commands[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var token = _step2.value;

                    if (!(token in this.commands)) {
                        throw new ClickError('Invalid command: ' + token);
                    }
                    result = context.commands[token];
                    context = result.context;
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

            return result;
        }
    }, {
        key: 'getHandler',
        value: function getHandler() {
            return this.handlerFn;
        }
    }, {
        key: 'getHelp',
        value: function getHelp() {
            return new Help(this).getHelp();
        }

        // Static methods

    }], [{
        key: 'parse',
        value: function parse(argv) {
            return new Click().parse(argv);
        }
    }]);

    return Click;
}();

module.exports = Click;
//# sourceMappingURL=cli-ck.js.map