
var _ = require('lodash')
var util = require('util')
var Parser = require('./parser')

function ValidationError(message) {
    Error.call(this)
    this.message = message
}
util.inherits(ValidationError, Error)

function Validator(context) {
    this.context = context
}

_.extend(Validator.prototype, {

    validate: function validate(input) {
        if (typeof input === 'undefined') {
            throw new ValidationError('no input provided to Validator')
        }

        if (typeof input === 'string') {
            var parser = new Parser(this.context)
            input = parser.parse(input)
        }

        if (typeof input.args === 'undefined' ||
            typeof input.opts === 'undefined' ||
            typeof input.context === 'undefined') {
            throw new ValidationError('invalid input')
        }

        this.checkRequiredArgs(input)
        this.checkArgChoices(input)
        this.checkNumArgs(input)

        return true
    },

    checkRequiredArgs: function checkRequiredArgs(input) {

        var opts = input.opts
        var lastContext = input.lastContext

        for (var optName in lastContext.getRequiredOptions()) {
            
            var opt = lastContext.options[optName]
            var aliases = opt.getAliases()

            var invalidOption = _.find(aliases, function(alias) {
                if (!(alias in opts)) { return true }
                if (typeof opts[alias] === 'undefined') { return true }
                return false
            })

            if (invalidOption) {
                throw new ValidationError('required option not provided: ' + invalidOption)
            }
        }
    },

    checkArgChoices: function checkArgChoices(input) {

        var opts = input.opts
        var lastContext = input.lastContext

        for (var optName in opts) {
            var value = opts[optName]
            if (typeof value !== 'undefined' && optName in lastContext.options) {
                var opt = lastContext.options[optName]
                var choices = opt.hasChoices() ? opt.getChoices() : undefined
                if (choices && choices.indexOf(value) < 0) {
                    throw new ValidationError('Invalid value for ' + optName + ': ' + value)
                }
            }
        }
    },

    checkNumArgs: function checkNumArgs(input) {

        var args = input.args
        var lastContext = input.lastContext

        var minArgs = lastContext.getMinArgs()
        var maxArgs = lastContext.getMaxArgs()

        var numArgs = args.length
        if (numArgs < minArgs) {
            throw new ValidationError('At least ' + minArgs + ' args required')
        }
        if (numArgs > maxArgs) {
            throw new ValidationError('At most ' + maxArgs + ' args allowed')
        }
    },
})

module.exports = Validator
