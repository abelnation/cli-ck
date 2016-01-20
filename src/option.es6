
const TYPE_STRING = 'string'
const TYPE_COUNT = 'count'
const TYPE_BOOLEAN = 'boolean'
const TYPE_NUMBER = 'number'

class OptionError extends Error {}

class Option {
    constructor(name, config) {
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

        let {
            demand,
            required,
            desc,
            describe,
            description,
            alias,
            choices,
            defaultValue,
            type,
            string,
            boolean,
            number,
            count
        } = config

        this.description = desc || describe || description
        this.required = demand || required || false

        if (typeof alias === 'string') {
            this.aliases = [name, alias]
        } else if (typeof alias === 'object') {
            this.aliases = [name, ... alias]
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

    getName() { return this.name }
    getAliases() { return this.aliases }
    getDescription() { return this.description }
    getType() { return this.type }
    isBoolean() { return this.type === Option.Type.Boolean }
    isNumber() { return this.type === Option.Type.Number }
    isCount() { return this.type === Option.Type.Count }
    isString() { return this.type === Option.Type.String }
    isRequired() { return this.required ? this.required : false }
    hasDefaultValue() { return typeof this.defaultValue !== 'undefined' }
    getDefaultValue() { return this.defaultValue }
    hasChoices() { return typeof this.choices !== 'undefined' || typeof this.choicesFn !== 'undefined' }
    getChoices() {
        if (this.choicesFn && typeof this.choicesFn === 'function') {
            return this.choicesFn()
        } else {
            return this.choices
        }
    }
}

Option.Type = {
    Boolean: TYPE_BOOLEAN,
    Count: TYPE_COUNT,
    String: TYPE_STRING,
    Number: TYPE_NUMBER
}

module.exports = Option
