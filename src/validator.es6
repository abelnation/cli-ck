
const Parser = require('./parser')

class ValidationError extends Error {}

class Validator {
    constructor(context) {
        this.context = context
    }

    validate(input) {
        if (typeof input === 'undefined') {
            throw new ValidationError('no input provided to Validator')
        }

        if (typeof input === 'string') {
            const parser = new Parser(this.context)
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
    }

    checkRequiredArgs(input) {
        const { args, opts, lastContext } = input
        for (let optName in lastContext.getRequiredOptions()) {
            const opt = lastContext.options[optName]
            const aliases = opt.getAliases()
            for (let alias of aliases) {
                if ((alias in opts) && (typeof opts[alias] !== 'undefined')) {
                    continue
                } else {
                    throw new ValidationError('required option not provided: ' + alias)
                }
            }
        }
    }

    checkArgChoices(input) {
        const { opts, lastContext } = input
        for (let optName in opts) {
            const value = opts[optName]
            if (typeof value !== 'undefined' && optName in lastContext.options) {
                const opt = lastContext.options[optName]
                const choices = opt.hasChoices() ? opt.getChoices() : undefined
                if (choices && choices.indexOf(value) < 0) {
                    throw new ValidationError(`Invalid value for ${ optName }: ${ value }`)
                }
            }
        }
    }

    checkNumArgs(input) {
        const { args, lastContext } = input

        const minArgs = lastContext.getMinArgs()
        const maxArgs = lastContext.getMaxArgs()

        const numArgs = args.length
        if (numArgs < minArgs) {
            throw new ValidationError(`At least ${ minArgs } args required`)
        }
        if (numArgs > maxArgs) {
            throw new ValidationError(`At most ${ maxArgs } args allowed`)
        }
    }
}

module.exports = Validator
