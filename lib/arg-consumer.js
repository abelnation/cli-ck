'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _shellParse = require('shell-quote').parse;

function normalizeArgs(args) {
    var result = [];

    if (!args) {
        return result;
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var arg = _step.value;

            if (/^--/.test(arg)) {
                result.push(arg);
            } else if (/^-$/.test(arg)) {
                // treat a lone hyphen as an arg, not an option
                result.push(arg);
            } else if (/^-/.test(arg)) {
                var options = arg.replace(/^-/, '');
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var option = _step2.value;

                        if (!/[a-zA-Z]/.test(option)) {
                            throw new Error('invalid short option: ' + option);
                        }
                        result.push('-' + option);
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
            } else {
                result.push(arg);
            }
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

    return result;
}

var ArgConsumer = function () {
    function ArgConsumer(args) {
        _classCallCheck(this, ArgConsumer);

        if (typeof args === 'undefined') {
            args = [];
        }

        if (typeof args === 'string') {
            args = _shellParse(args);
        }

        if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) !== 'object') {
            throw new ClickError('Invalid argv value');
        }

        this.args = normalizeArgs(args);
        this.current = this.args.slice(0);

        // console.log('ArgConsumer')
        // console.dir(this)
    }

    _createClass(ArgConsumer, [{
        key: 'peek',
        value: function peek(num) {
            if (typeof num === 'undefined') {
                return this.current[0];
            }

            if (typeof num !== 'number' || num < 0) {
                throw new Error('num must be >= 0');
            }

            num = Math.min(num, this.current.length);
            return this.current.slice(0, num);
        }
    }, {
        key: 'peekLast',
        value: function peekLast(num) {
            if (typeof num === 'undefined') {
                return this.current[this.current.length - 1];
            }

            if (typeof num !== 'number' || num < 0) {
                throw new Error('num must be >= 0');
            }

            num = Math.min(num, this.current.length);
            return this.current.slice(this.current.length - num, this.current.length);
        }
    }, {
        key: 'next',
        value: function next(num) {
            var result = undefined;
            if (num) {
                result = this.current.slice(0, num);
                this.current = this.current.slice(num);
            } else {
                result = this.current[0];
                this.current = this.current.slice(1);
            }
            return result;
        }
    }, {
        key: 'hasNext',
        value: function hasNext() {
            return this.current.length > 0;
        }
    }, {
        key: 'numRemaining',
        value: function numRemaining() {
            return this.current.length;
        }
    }], [{
        key: 'cleanArgv',
        value: function cleanArgv(argv) {
            if (!argv) {
                return new ArgConsumer();
            }

            if (argv.constructor !== ArgConsumer) {
                return new ArgConsumer(argv);
            }
            return argv;
        }
    }, {
        key: 'shellParse',
        value: function shellParse(argv) {
            if (typeof argv !== 'string') {
                throw new Error('shellParse only takes strings');
            }
            return _shellParse(argv);
        }
    }]);

    return ArgConsumer;
}();

module.exports = ArgConsumer;
//# sourceMappingURL=arg-consumer.js.map