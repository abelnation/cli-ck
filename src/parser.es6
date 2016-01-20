const _ = require('lodash')
const ArgConsumer = require('./arg-consumer')
const shellParse = require('shell-quote').parse

class Parser {
    constructor(context) {
        this.context = context
    }

    parse(argv, cb) {
        // argv can be a string, an array, or an ArgConsumer
        // regardless, we ensure argv ends up as an ArgConsumer
        argv = ArgConsumer.cleanArgv(argv)

        let lastContext = this.context
        let result = {
            args: [],
            opts: {},
            command: '',
            context: this.context
        }

        // parse args, relying on helpers to parse different arg types
        while (argv.hasNext()) {
            // peek at first to help determine type of arg
            let next = argv.peek()

            if (/^--$/.test(next)) {
                // When '--' is encountered, stop analyzing and push rest of args
                // on to _ arg array
                argv.next()
                result.args = result.args.concat(argv.next(argv.numRemaining()))
            } else if (/^--/.test(next)) {
                this.consumeLongFormOption(next, argv, result)
            } else if (/^-/.test(next)) {
                // ArgConsumer ensures all short options are split apart
                // so we can safely consume an arg once per short option
                this.consumeShortFormOption(next, argv, result)
            } else if (next in this.context.commands) {
                // let sub-command parse the rest, and merge results
                const cmdParseResult = this.consumeCommand(next, argv, result)
                lastContext = cmdParseResult.lastContext
                this.mergeResults(result, cmdParseResult)
            } else {
                this.consumeArg(next, argv, result)
            }
        }

        // assign default values
        this.fillInDefaults(result)

        result.lastContext = lastContext
        result.argv = argv

        if (cb) {
            return cb(null, result)
        } else {
            return result
        }
    }

    // helper methods

    consumeLongFormOption(arg, argv, result) {
        const optionName = arg.replace(/^--/, '')
        if (/^--.*=.*/.test(arg)) {
            const [ name, value ] = optionName.split('=')
            this.consumeExplicitSetOptionValue(name, value, argv, result)
            argv.next()
        } else {
            const optionName = arg.replace(/^--/, '')
            this.consumeOption(optionName, argv, result)
        }
    }

    consumeShortFormOption(arg, argv, result) {
        const optionName = arg.replace(/^-/, '')
        this.consumeOption(optionName, argv, result)
    }

    // e.g. '--foo=bar --baz=false
    consumeExplicitSetOptionValue(optionName, value, argv, result) {
        if (optionName in this.context.options) {
            const opt = this.context.options[optionName]
            if (opt.isBoolean()) {
                this.setBooleanOptionValue(result, optionName, value)
            } else if (opt.isCount()) {
                // can explicitly set count value
                this.setNumberOptionValue(result, optionName, value)
            } else if (opt.isString()) {
                this.setStringOptionValue(result, optionName, value)
            } else if (opt.isNumber()) {
                this.setNumberOptionValue(result, optionName, value)
            }
        } else {
            this.setStringOptionValue(result, name, value)
        }
    }

    consumeOption(optionName, argv, result) {
        if (optionName in this.context.options) {
            const opt = this.context.options[optionName]
            if (opt.isBoolean()) {
                this.consumeBoolean(optionName, argv, result)
            } else if (opt.isCount()) {
                this.consumeCount(optionName, argv, result)
            } else if (opt.isString()) {
                this.consumeString(optionName, argv, result)
            } else if (opt.isNumber()) {
                this.consumeNumber(optionName, argv, result)
            }
        } else {
            this.consumeBoolean(optionName, argv, result)
        }
    }

    consumeCommand(commandName, argv, result) {
        if (!result.command) {
            result.command = commandName
        } else {
            result.command += Parser.COMMAND_DELIM + commandName
        }

        argv.next()

        const cmd = this.context.commands[commandName]
        return (new Parser(cmd.context)).parse(argv)
    }

    consumeArg(arg, argv, result) {
        // add to args
        this.addArg(result, arg)
        argv.next()
    }

    consumeNumber(optionName, argv, result) {
        let value = argv.peek(2)[1]
        if (!/^--/.test(value)) {
            this.setNumberOptionValue(result, optionName, value)
            argv.next(2)
        } else {
            argv.next()
        }
    }

    consumeCount(optionName, argv, result) {
        this.incrementCountOptionValue(result, optionName)
        argv.next()
    }

    consumeString(optionName, argv, result) {
        let value = argv.peek(2)[1]
        if (!/^--/.test(value)) {
            this.setStringOptionValue(result, optionName, value)
            argv.next(2)
        } else {
            argv.next()
        }
    }

    consumeBoolean(optionName, argv, result) {
        this.setBooleanOptionValue(result, optionName, true)
        argv.next()
    }

    addArg(result, arg) {
        result.args.push(arg)
    }

    setOptionValueForAllAliases(result, name, value) {
        if (name in this.context.options) {
            for (let alias of this.context.options[name].getAliases()) {
                result.opts[alias] = value
            }
        } else {
            result.opts[name] = value
        }
    }

    setBooleanOptionValue(result, name, value) {
        const trueRe = new RegExp('1|yes|y|t|true', 'i')
        const boolVal = trueRe.test(value)
        this.setOptionValueForAllAliases(result, name, boolVal)
    }

    setStringOptionValue(result, name, value) {
        this.setOptionValueForAllAliases(result, name, value)
    }

    incrementCountOptionValue(result, name) {
        let newValue
        if (name in result.opts) {
            newValue = result.opts[name] + 1
        } else {
            newValue = 1
        }

        this.setOptionValueForAllAliases(result, name, newValue)
    }

    setNumberOptionValue(result, name, value) {
        const numVal = parseFloat(value)
        if (isNaN(numVal)) {
            return
        }
        this.setOptionValueForAllAliases(result, name, numVal)
    }

    fillInDefaults(result) {
        // fill in provided defaultValues
        for (let optName in this.context.optDefaults) {
            for (let alias of this.context.options[optName].getAliases()) {
                if (typeof result.opts[alias] === 'undefined') {
                    result.opts[alias] = this.context.options[alias].defaultValue
                }
            }
        }

        // counts without defaultValue should default to 0
        for (let optName in this.context.options) {
            const opt = this.context.options[optName]
            if (opt.isCount() && typeof result.opts[optName] === 'undefined') {
                result.opts[optName] = 0
            }
        }

        // booleans without defaultValue should default to false
        for (let optName in this.context.options) {
            const opt = this.context.options[optName]
            if (opt.isBoolean() && typeof result.opts[optName] === 'undefined') {
                result.opts[optName] = false
            }
        }
    }

    mergeResults(result, subresult) {
        // merge result with sub-command result
        if (!result) {
            throw new Error('result is null')
        }
        if (!subresult) {
            throw new Error('subresult is null')
        }

        // args
        result.args = result.args.concat(subresult.args)

        // opts
        for (let key in subresult.opts) {
            result.opts[key] = subresult.opts[key]
        }

        // command
        if (subresult.command) {
            result.command = result.command + Parser.COMMAND_DELIM + subresult.command
        }

        // argv not changed
    }
}

Parser.COMMAND_DELIM = ' '

module.exports = Parser
