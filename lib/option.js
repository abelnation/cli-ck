
var _ = require('lodash')
var util = require('util')

var TYPE_STRING = 'string'
var TYPE_COUNT = 'count'
var TYPE_BOOLEAN = 'boolean'
var TYPE_NUMBER = 'number'

function OptionError(message) {
    Error.call(this)
    this.message = message
}
util.inherits(OptionError, Error)

function Option(name, config) {
    if (typeof name === 'undefined') {
        throw new OptionError('name is required')
    }

    if (/^_/.test(name)) {
        throw new OptionError('name may not begin with "_"')
    }

    // Create canonical option object
    this.name = name
    this.aliases = [ name ]
    this.type = TYPE_BOOLEAN

    if (!config) {
        return
    }

    var demand = config.demand
    var required = config.required
    var desc = config.desc
    var describe = config.describe
    var description = config.description
    var alias = config.alias
    var choices = config.choices
    var defaultValue = config.defaultValue
    var type = config.type
    var string = config.string
    var boolean = config.boolean
    var number = config.number
    var count = config.count

    this.description = desc || describe || description || ''
    this.required = demand || required || false

    if (typeof alias === 'string') {
        this.aliases = [name, alias]
    } else if (typeof alias === 'object') {
        this.aliases = this.aliases.concat(alias)
    }

    if (typeof choices === 'function') {
        this.choicesFn = choices
        this.type = TYPE_STRING
    } else if (typeof choices === 'object') {
        this.choices = choices
        this.type = TYPE_STRING
    }

    if (typeof defaultValue !== 'undefined') {
        this.defaultValue = defaultValue
    }

    // Parse type
    if (type) {
        this.type = type
    }
    if (boolean) {
        this.type = TYPE_BOOLEAN
        if (this.choices || this.choicesFn) {
            throw new OptionError('boolean options cannot have choices')
        }
    }
    if (string) {
        this.type = TYPE_STRING
    }
    if (number) {
        this.type = TYPE_NUMBER
    }
    if (count) {
        this.type = TYPE_COUNT
        if (this.choices || this.choicesFn) {
            throw new OptionError('count options cannot have choices')
        }
    }

    // Only certain types of options can be required
    if (this.required) {
        if (this.type === TYPE_COUNT) {
            throw new OptionError('count options cannot be required')
        }

        // user provided bool explicitly
        if (boolean || type === TYPE_BOOLEAN) {
            throw new OptionError('bool options cannot be required')
        }

        // override default
        if (this.type === TYPE_BOOLEAN) {
            this.type = TYPE_STRING
        }
    }
}

_.extend(Option.prototype, {
    getName: function getName() {
        return this.name
    },

    getAliases: function getAliases() {
        return this.aliases
    },

    getDescription: function getDescription() {
        return this.description
    },

    getType: function getType() {
        return this.type
    },

    isBoolean: function isBoolean() {
        return this.type === Option.Type.Boolean
    },

    isNumber: function isNumber() {
        return this.type === Option.Type.Number
    },

    isCount: function isCount() {
        return this.type === Option.Type.Count
    },

    isString: function isString() {
        return this.type === Option.Type.String
    },

    isRequired: function isRequired() {
        return this.required ? this.required : false
    },

    hasDefaultValue: function hasDefaultValue() {
        return typeof this.defaultValue !== 'undefined'
    },

    getDefaultValue: function getDefaultValue() {
        return this.defaultValue
    },

    hasChoices: function hasChoices() {
        return typeof this.choices !== 'undefined' || typeof this.choicesFn !== 'undefined'
    },

    getChoices: function getChoices() {
        if (this.choicesFn && typeof this.choicesFn === 'function') {
            return this.choicesFn()
        } else {
            return this.choices
        }
    },
})

Option.Type = {
    Boolean: TYPE_BOOLEAN,
    Count: TYPE_COUNT,
    String: TYPE_STRING,
    Number: TYPE_NUMBER
}

module.exports = Option
