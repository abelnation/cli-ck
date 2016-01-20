'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parser = require('./parser');

var ValidationError = function (_Error) {
    _inherits(ValidationError, _Error);

    function ValidationError() {
        _classCallCheck(this, ValidationError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ValidationError).apply(this, arguments));
    }

    return ValidationError;
}(Error);

var Validator = function () {
    function Validator(context) {
        _classCallCheck(this, Validator);

        this.context = context;
    }

    _createClass(Validator, [{
        key: 'validate',
        value: function validate(input) {
            if (typeof input === 'undefined') {
                throw new ValidationError('no input provided to Validator');
            }

            if (typeof input === 'string') {
                var parser = new Parser(this.context);
                input = parser.parse(input);
            }

            if (typeof input.args === 'undefined' || typeof input.opts === 'undefined' || typeof input.context === 'undefined') {
                throw new ValidationError('invalid input');
            }

            this.checkRequiredArgs(input);
            this.checkArgChoices(input);
            this.checkNumArgs(input);

            return true;
        }
    }, {
        key: 'checkRequiredArgs',
        value: function checkRequiredArgs(input) {
            var args = input.args;
            var opts = input.opts;
            var lastContext = input.lastContext;

            for (var optName in lastContext.getRequiredOptions()) {
                var opt = lastContext.options[optName];
                var aliases = opt.getAliases();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = aliases[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var alias = _step.value;

                        if (alias in opts && typeof opts[alias] !== 'undefined') {
                            continue;
                        } else {
                            throw new ValidationError('required option not provided: ' + alias);
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
            }
        }
    }, {
        key: 'checkArgChoices',
        value: function checkArgChoices(input) {
            var opts = input.opts;
            var lastContext = input.lastContext;

            for (var optName in opts) {
                var value = opts[optName];
                if (typeof value !== 'undefined' && optName in lastContext.options) {
                    var opt = lastContext.options[optName];
                    var choices = opt.hasChoices() ? opt.getChoices() : undefined;
                    if (choices && choices.indexOf(value) < 0) {
                        throw new ValidationError('Invalid value for ' + optName + ': ' + value);
                    }
                }
            }
        }
    }, {
        key: 'checkNumArgs',
        value: function checkNumArgs(input) {
            var args = input.args;
            var lastContext = input.lastContext;

            var minArgs = lastContext.getMinArgs();
            var maxArgs = lastContext.getMaxArgs();

            var numArgs = args.length;
            if (numArgs < minArgs) {
                throw new ValidationError('At least ' + minArgs + ' args required');
            }
            if (numArgs > maxArgs) {
                throw new ValidationError('At most ' + maxArgs + ' args allowed');
            }
        }
    }]);

    return Validator;
}();

module.exports = Validator;
//# sourceMappingURL=validator.js.map