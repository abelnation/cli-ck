'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TYPE_STRING = 'string';
var TYPE_COUNT = 'count';
var TYPE_BOOLEAN = 'boolean';
var TYPE_NUMBER = 'number';

var OptionError = function (_Error) {
    _inherits(OptionError, _Error);

    function OptionError() {
        _classCallCheck(this, OptionError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(OptionError).apply(this, arguments));
    }

    return OptionError;
}(Error);

var Option = function () {
    function Option(name, config) {
        _classCallCheck(this, Option);

        if (typeof name === 'undefined') {
            throw new OptionError('name is required');
        }

        if (/^_/.test(name)) {
            throw new OptionError('name may not begin with "_"');
        }

        // Create canonical option object
        this.name = name;
        this.aliases = [name];
        this.type = TYPE_BOOLEAN;

        if (!config) {
            return;
        }

        var demand = config.demand;
        var required = config.required;
        var desc = config.desc;
        var describe = config.describe;
        var description = config.description;
        var alias = config.alias;
        var choices = config.choices;
        var defaultValue = config.defaultValue;
        var type = config.type;
        var string = config.string;
        var boolean = config.boolean;
        var number = config.number;
        var count = config.count;

        this.description = desc || describe || description;
        this.required = demand || required || false;

        if (typeof alias === 'string') {
            this.aliases = [name, alias];
        } else if ((typeof alias === 'undefined' ? 'undefined' : _typeof(alias)) === 'object') {
            this.aliases = [name].concat(_toConsumableArray(alias));
        }

        if (typeof choices === 'function') {
            this.choicesFn = choices;
            this.type = TYPE_STRING;
        } else if ((typeof choices === 'undefined' ? 'undefined' : _typeof(choices)) === 'object') {
            this.choices = choices;
            this.type = TYPE_STRING;
        }

        if (typeof defaultValue !== 'undefined') {
            this.defaultValue = defaultValue;
        }

        // Parse type
        if (type) {
            this.type = type;
        }
        if (boolean) {
            this.type = TYPE_BOOLEAN;
            if (this.choices || this.choicesFn) {
                throw new OptionError('boolean options cannot have choices');
            }
        }
        if (string) {
            this.type = TYPE_STRING;
        }
        if (number) {
            this.type = TYPE_NUMBER;
        }
        if (count) {
            this.type = TYPE_COUNT;
            if (this.choices || this.choicesFn) {
                throw new OptionError('count options cannot have choices');
            }
        }

        // Only certain types of options can be required
        if (this.required) {
            if (this.type === TYPE_COUNT) {
                throw new OptionError('count options cannot be required');
            }

            // user provided bool explicitly
            if (boolean || type === TYPE_BOOLEAN) {
                throw new OptionError('bool options cannot be required');
            }

            // override default
            if (this.type === TYPE_BOOLEAN) {
                this.type = TYPE_STRING;
            }
        }
    }

    _createClass(Option, [{
        key: 'getName',
        value: function getName() {
            return this.name;
        }
    }, {
        key: 'getAliases',
        value: function getAliases() {
            return this.aliases;
        }
    }, {
        key: 'getDescription',
        value: function getDescription() {
            return this.description;
        }
    }, {
        key: 'getType',
        value: function getType() {
            return this.type;
        }
    }, {
        key: 'isBoolean',
        value: function isBoolean() {
            return this.type === Option.Type.Boolean;
        }
    }, {
        key: 'isNumber',
        value: function isNumber() {
            return this.type === Option.Type.Number;
        }
    }, {
        key: 'isCount',
        value: function isCount() {
            return this.type === Option.Type.Count;
        }
    }, {
        key: 'isString',
        value: function isString() {
            return this.type === Option.Type.String;
        }
    }, {
        key: 'isRequired',
        value: function isRequired() {
            return this.required ? this.required : false;
        }
    }, {
        key: 'hasDefaultValue',
        value: function hasDefaultValue() {
            return typeof this.defaultValue !== 'undefined';
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.defaultValue;
        }
    }, {
        key: 'hasChoices',
        value: function hasChoices() {
            return typeof this.choices !== 'undefined' || typeof this.choicesFn !== 'undefined';
        }
    }, {
        key: 'getChoices',
        value: function getChoices() {
            if (this.choicesFn && typeof this.choicesFn === 'function') {
                return this.choicesFn();
            } else {
                return this.choices;
            }
        }
    }]);

    return Option;
}();

Option.Type = {
    Boolean: TYPE_BOOLEAN,
    Count: TYPE_COUNT,
    String: TYPE_STRING,
    Number: TYPE_NUMBER
};

module.exports = Option;
//# sourceMappingURL=option.js.map