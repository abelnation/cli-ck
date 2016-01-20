'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Click = undefined;

var CommandError = function (_Error) {
    _inherits(CommandError, _Error);

    function CommandError() {
        _classCallCheck(this, CommandError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CommandError).apply(this, arguments));
    }

    return CommandError;
}(Error);

var Command = function () {
    function Command(name, config, parentContext, setupContext) {
        _classCallCheck(this, Command);

        // handle circular dependency
        if (!Click) {
            Click = require('./cli-ck');
        }

        if (!name) {
            throw new CommandError('name is required');
        }
        if (!parentContext || parentContext.constructor !== Click) {
            throw new CommandError('parentContext required and must be Click instance');
        }
        if (/^_/.test(name)) {
            throw new CommandError('name may not start with "_"');
        }
        this.name = name;

        if (!config) {
            config = {};
        }
        var _config = config;
        var description = _config.description;
        var describe = _config.describe;
        var desc = _config.desc;

        this.description = description || describe || desc;

        this.parentContext = parentContext;
        if (setupContext && setupContext.constructor === Click) {
            // can pass in a pre-constructed yargs object as context
            this.context = setupContext;
        } else {
            // or can pass a configurator fn that takes a blank yargs object
            this.context = new Click();
            if (typeof setupContext === 'function') {
                setupContext(this.context);
            }
        }

        // TODO: check if explicitly set before inheriting
        var contextName = parentContext.getName() + ' ' + this.getName();
        this.context.name(contextName);
        this.context.description(this.getDescription());
        this.context.version(parentContext.getVersion());
    }

    _createClass(Command, [{
        key: 'getName',
        value: function getName() {
            return this.name;
        }
    }, {
        key: 'getDescription',
        value: function getDescription() {
            return this.description;
        }
    }, {
        key: 'getContext',
        value: function getContext() {
            return this.context;
        }
    }]);

    return Command;
}();

module.exports = Command;
//# sourceMappingURL=command.js.map