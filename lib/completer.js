'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parser = require('./parser');
var Option = require('./option');
var ArgConsumer = require('./arg-consumer');

function getReplTabCompletions(line, callback) {

    // console.log('')

    var _getCompletions = new Completer(this).getCompletions(line);

    var completions = _getCompletions.completions;
    var tokenToComplete = _getCompletions.tokenToComplete;

    // console.log(`completion result`)
    // console.log(`  completions: ${ completions }`)
    // console.log(`  toComplete: ${ tokenToComplete }`)

    return callback(null, [completions, tokenToComplete]);
}

var Completer = function () {
    function Completer(context) {
        _classCallCheck(this, Completer);

        this.context = context;
    }

    _createClass(Completer, [{
        key: 'getCompletions',
        value: function getCompletions(line, cb) {

            // console.log(`getCompletions: ${ line }`)

            var argv = ArgConsumer.cleanArgv(line);

            var lastChar = line.charAt(line.length - 1);
            var lastTokenIsEmpty = lastChar === '' || lastChar === ' ';
            var hasPreviousToken = argv.numRemaining() >= (lastTokenIsEmpty ? 1 : 2);

            // console.log(`lastTokenIsEmpty: ${ lastTokenIsEmpty }`)
            // console.log(`hasPreviousToken: ${ hasPreviousToken }`)

            var tokensMinusCurrent = undefined;
            if (hasPreviousToken) {
                tokensMinusCurrent = lastTokenIsEmpty ? argv.current : argv.current.slice(0, -1);
            } else {
                tokensMinusCurrent = [];
            }

            // console.log(`tokensMinusCurrent: ${ tokensMinusCurrent }`)

            var partialParseResult = new Parser(this.context).parse(tokensMinusCurrent);
            var lastContext = partialParseResult.lastContext;

            console.log('tokensMinusCurrent: ' + tokensMinusCurrent);

            var optionNames = lastContext.getOptionNames();
            var commandNames = lastContext.getCommandNames();

            console.log('options: ' + optionNames);

            var prevToken = undefined;
            if (hasPreviousToken) {
                if (lastTokenIsEmpty) {
                    prevToken = argv.peekLast();
                } else {
                    prevToken = argv.peekLast(2)[0];
                }
            }

            // console.log(`prevToken: ${ prevToken }`)
            var toComplete = lastTokenIsEmpty ? '' : argv.peekLast();

            console.log(line);
            console.log('toComplete: \'' + toComplete + '\'');
            console.log('hasPreviousToken: ' + hasPreviousToken);
            console.log('lastTokenIsEmpty: ' + lastTokenIsEmpty);
            console.log('prevToken: \'' + prevToken + '\'');
            console.log('argv:');
            console.dir(argv);

            var completions = this.getMatchesWithChoices(toComplete, commandNames);

            if (/^--/.test(toComplete)) {
                // console.log('matching long option...')
                // complete long option name
                completions = this.getMatchesWithChoices(toComplete.replace(/^--/, ''), optionNames).map(function (x) {
                    return '--' + x;
                });
            } else if (/^-$/.test(toComplete)) {
                // console.log('matching long option with single hyphen...')
                // treat '-' as a special case
                completions = optionNames.map(function (x) {
                    return '--' + x;
                });
            } else if (/^-/.test(toComplete)) {
                // console.log('skipping matching of short option')
                // don't attempt to complete short opts, since they can
                // be combined together into one long string e.g. '-abcv'
                completions = [];
            } else if (hasPreviousToken) {
                // check to see if argument for previous option
                if (/^-/.test(prevToken)) {
                    // console.log('matching value for previous option...')

                    var prevOption = this.context.options[prevToken.replace(/^-(-?)/, '')];
                    if (prevOption.choices && (prevOption.type === Option.Type.String || prevOption.type === Option.Type.Number)) {
                        completions = this.getMatchesWithChoices(toComplete, prevOption.choices);
                    }
                }
            }

            var result = {
                line: line,
                completions: completions,
                tokenToComplete: toComplete
            };

            if (cb) {
                return cb(null, result);
            } else {
                return result;
            }
        }
    }, {
        key: 'getMatchesWithChoices',
        value: function getMatchesWithChoices(partial, choices) {
            return choices.filter(function (choice) {
                return new RegExp('^' + partial).test(choice);
            });
        }
    }], [{
        key: 'getReplTabCompleteCallback',
        value: function getReplTabCompleteCallback(context) {
            return getReplTabCompletions.bind(context);
        }
    }]);

    return Completer;
}();

module.exports = Completer;
//# sourceMappingURL=completer.js.map