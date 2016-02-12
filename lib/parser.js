var _ = require('lodash')
var ArgConsumer = require('./arg-consumer')

function Parser(context) {
    this.context = context
}

_.extend(Parser.prototype, {

    parse: function parse(argv, cb) {
        // argv can be a string, an array, or an ArgConsumer
        // regardless, we ensure argv ends up as an ArgConsumer
        argv = ArgConsumer.cleanArgv(argv)

        var lastContext = this.context
        var result = {
            args: [],
            opts: {},
            command: '',
            context: this.context
        }

        // parse args, relying on helpers to parse different arg types
        while (argv.hasNext()) {
            // peek at first to help determine type of arg
            var next = argv.peek()

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
                var cmdParseResult = this.consumeCommand(next, argv, result)
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
    },

    // helper methods

    consumeLongFormOption: function consumeLongFormOption(arg, argv, result) {
        var optionName = arg.replace(/^--/, '')
        if (/^--.*=.*/.test(arg)) {
            var tokens = optionName.split('=')
            var name = tokens[0]
            var value = tokens[1]
            this.consumeExplicitSetOptionValue(name, value, argv, result)
            argv.next()
        } else {
            var optionName = arg.replace(/^--/, '')
            this.consumeOption(optionName, argv, result)
        }
    },

    consumeShortFormOption: function consumeShortFormOption(arg, argv, result) {
        var optionName = arg.replace(/^-/, '')
        this.consumeOption(optionName, argv, result)
    },

    // e.g. '--foo=bar --baz=false
    consumeExplicitSetOptionValue: function consumeExplicitSetOptionValue(optionName, value, argv, result) {
        if (optionName in this.context.options) {
            var opt = this.context.options[optionName]
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
    },

    consumeOption: function consumeOption(optionName, argv, result) {
        if (optionName in this.context.options) {
            var opt = this.context.options[optionName]
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
    },

    consumeCommand: function consumeCommand(commandName, argv, result) {
        if (!result.command) {
            result.command = commandName
        } else {
            result.command += Parser.COMMAND_DELIM + commandName
        }

        argv.next()

        var cmd = this.context.commands[commandName]
        return (new Parser(cmd.context)).parse(argv)
    },

    consumeArg: function consumeArg(arg, argv, result) {
        // add to args
        this.addArg(result, arg)
        argv.next()
    },

    consumeNumber: function consumeNumber(optionName, argv, result) {
        var value = argv.peek(2)[1]
        if (!/^--/.test(value)) {
            this.setNumberOptionValue(result, optionName, value)
            argv.next(2)
        } else {
            argv.next()
        }
    },

    consumeCount: function consumeCount(optionName, argv, result) {
        this.incrementCountOptionValue(result, optionName)
        argv.next()
    },

    consumeString: function consumeString(optionName, argv, result) {
        var value = argv.peek(2)[1]
        if (!/^--/.test(value)) {
            this.setStringOptionValue(result, optionName, value)
            argv.next(2)
        } else {
            argv.next()
        }
    },

    consumeBoolean: function consumeBoolean(optionName, argv, result) {
        this.setBooleanOptionValue(result, optionName, true)
        argv.next()
    },

    addArg: function addArg(result, arg) {
        result.args.push(arg)
    },

    setOptionValueForAllAliases: function setOptionValueForAllAliases(result, name, value) {
        if (name in this.context.options) {
            _.forEach(this.context.options[name].getAliases(), function(alias) {
                result.opts[alias] = value
            })
        } else {
            result.opts[name] = value
        }
    },

    setBooleanOptionValue: function setBooleanOptionValue(result, name, value) {
        var trueRe = new RegExp('1|yes|y|t|true', 'i')
        var boolVal = trueRe.test(value)
        this.setOptionValueForAllAliases(result, name, boolVal)
    },

    setStringOptionValue: function setStringOptionValue(result, name, value) {
        this.setOptionValueForAllAliases(result, name, value)
    },

    incrementCountOptionValue: function incrementCountOptionValue(result, name) {
        var newValue
        if (name in result.opts) {
            newValue = result.opts[name] + 1
        } else {
            newValue = 1
        }

        this.setOptionValueForAllAliases(result, name, newValue)
    },

    setNumberOptionValue: function setNumberOptionValue(result, name, value) {
        var numVal = parseFloat(value)
        if (isNaN(numVal)) {
            return
        }
        this.setOptionValueForAllAliases(result, name, numVal)
    },

    fillInDefaults: function fillInDefaults(result) {
        // fill in provided defaultValues
        _.forEach(this.context.optDefaults, _.bind(function(optValue, optName) {
            _.forEach(this.context.options[optName].getAliases(), _.bind(function(alias) {
                if (typeof result.opts[alias] === 'undefined') {
                    result.opts[alias] = this.context.options[alias].defaultValue
                }
            }, this))
        }, this))

        // counts without defaultValue should default to 0
        _.forEach(this.context.options, _.bind(function(optValue, optName) {
            var opt = this.context.options[optName]
            if (opt.isCount() && typeof result.opts[optName] === 'undefined') {
                result.opts[optName] = 0
            }
        }, this))

        // booleans without defaultValue should default to false
        _.forEach(this.context.options, _.bind(function(optValue, optName) {
            var opt = this.context.options[optName]
            if (opt.isBoolean() && typeof result.opts[optName] === 'undefined') {
                result.opts[optName] = false
            }
        }, this))
    },

    mergeResults: function mergeResults(result, subresult) {
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
        _.forEach(subresult.opts, function(val, key) {
            result.opts[key] = subresult.opts[key]
        })

        // command
        if (subresult.command) {
            result.command = result.command + Parser.COMMAND_DELIM + subresult.command
        }

        // argv not changed
    },
})

Parser.COMMAND_DELIM = ' '

module.exports = Parser
