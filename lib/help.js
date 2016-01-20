'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Click = undefined;
var Parser = require('./parser');

var Help = function () {
    function Help(context) {
        _classCallCheck(this, Help);

        this.context = context;
    }

    _createClass(Help, [{
        key: 'getHelp',
        value: function getHelp() {
            return [].concat(this.getHeader(), this.getCommands(), this.getOptions()).join('\n');
        }
    }, {
        key: 'getHeader',
        value: function getHeader() {
            var result = [''];

            var name = this.context.getName();
            var description = this.context.getDescription();
            if (name) {
                result.push(name + (description ? ' - ' + description : ''));
            }

            var version = this.context.getVersion();
            if (version) {
                result.push('version: ' + version);
            }

            var usage = this.context.getUsage();
            if (usage) {
                if (typeof usage === 'string') {
                    result.push('usage: ' + this.context.getUsage());
                } else if ((typeof usage === 'undefined' ? 'undefined' : _typeof(usage)) === 'object') {
                    for (var i = 0; i < usage.length; i++) {
                        var prefix = i === 0 ? 'Usage:' : '      ';
                        result.push(prefix + ' ' + usage[i]);
                    }
                }
            }
            if (result.length > 0) {
                result.push('');
            }
            return result;
        }
    }, {
        key: 'getCommands',
        value: function getCommands() {
            var _this = this;

            if (this.context.getCommandNames().length === 0) {
                return [];
            }
            var cmdLines = this.context.getCommandNames().map(function (cmdName) {
                var cmd = _this.context.commands[cmdName];
                return '  ' + cmd.getName() + '  -  ' + cmd.getDescription();
            });
            return ['Commands:'].concat(_toConsumableArray(cmdLines), ['']);
        }
    }, {
        key: 'getOptions',
        value: function getOptions() {
            var _this2 = this;

            if (this.context.getOptionNames().length === 0) {
                return [];
            }
            var optLines = Object.keys(this.context.optNames).map(function (optName) {
                var opt = _this2.context.options[optName];
                return '  ' + opt.getName() + '  -  ' + opt.getDescription();
            });
            return ['Options:'].concat(_toConsumableArray(optLines));
        }
    }], [{
        key: 'getHelpCommandContext',
        value: function getHelpCommandContext() {
            // handle circular dependency
            if (!Click) {
                Click = require('./cli-ck');
            }

            return new Click({ noHelp: true }).handler(function (args, opts, argv, parentContext, lastContext) {
                // parse line after 'help' to figure out command context
                // to print help for

                console.dir(argv);

                var helpIdx = argv.indexOf('help');

                var parseResult = new Parser(parentContext).parse(argv.slice(helpIdx + 1));
                var cmdContext = parseResult.lastContext;

                var helpText = new Help(cmdContext).getHelp();
                console.log(helpText);
            });
        }
    }]);

    return Help;
}();

module.exports = Help;
//# sourceMappingURL=help.js.map