
var _ = require('lodash')
var nodeREPL = require('repl')
var path = require('path')
var util = require('util')
var ArgConsumer = require('./arg-consumer')
var Option = require('./option')
var Command = require('./command')
var Completer = require('./completer')
var Parser = require('./parser')
var Validator = require('./validator')
var Help = require('./help')

function ClickError(message) {
    Error.call(this)
    this.message = message
}
util.inherits(ClickError, Error)

function Click(config) {
    // options
    this.options = {}
    this.optDefaults = {}
    this.optNames = {}
    this.requiredOpts = {}

    // commands
    this.commands = {}

    // misc config
    this.config = {}

    // default name to top-level script name
    var mainPath = require.resolve(require.main.filename)
    if (mainPath) {
        var mainTokens = mainPath.split(path.sep)
        this.config.name = mainTokens[mainTokens.length - 1]
    }

    this.option('version', { alias: 'v', desc: 'print version' })
    this.option('help', { alias: [ 'h', 'H' ], desc: 'print help' })

    var noHelp = config ? config.noHelp : false
    if (!noHelp) {
        this.command('help', Help.getHelpCommandContext())
    }
}

_.extend(Click.prototype, {

    parse: function parse(argv, cb) {
        var parseResult = (new Parser(this)).parse(argv, cb)

        if (cb) {
            return cb(null, parseResult)
        } else {
            return parseResult
        }
    },

    run: function run(argv, cb) {
        argv = ArgConsumer.cleanArgv(argv)

        var helpPrinted = false

        // parse
        var parseResult = (new Parser(this)).parse(argv, cb)
        if (parseResult.opts.repl) {
            return this.repl(argv, cb)
        }

        var lastContext = parseResult.lastContext
        var handler = lastContext.getHandler()

        if (parseResult.opts.help && !helpPrinted) {
            helpPrinted = true
            console.log(lastContext.getHelp())
        }
        if (parseResult.opts.version) {
            console.log('Version: ' + this.config.version)
        }

        // validate
        try {
            var isValid = (new Validator(this)).validate(parseResult)
            if (!isValid) {
                console.error('Error: Invalid input')
                return
            }
        } catch (e) {
            if (!helpPrinted) {
                helpPrinted = true
                console.log(lastContext.getHelp())
            }
            console.log('')
            console.error('Error: ' + e.message)
            return
        }

        // run
        if (handler && typeof handler === 'function') {
            var args = parseResult.args
            var opts = parseResult.opts

            handler(args, opts, argv.args, this, lastContext)
        } else {
            if (!helpPrinted) {
                console.log(lastContext.getHelp())
            }
        }
    },

    repl: function repl(argv, cb) {
        // start repl
        this.command('exit', { desc: 'exit the program' }, new Click().handler(function () {
            process.exit(0)
        }))

        var server = nodeREPL.start({
            prompt: '> ',
            eval: function (line, nodeContext, filename, callback) {
                line = line.slice(1,-2)
                this.run(line)
                server.displayPrompt()
            },
        })

        // backup original complete fn
        server._complete = server.complete

        // assign repl completion fn
        server.complete = Completer.getReplTabCompleteCallback(this)
    },

    validate: function validate(line, cb) {
        return (new Validator(this)).validate(line)
    },

    complete: function complete(line, cb) {
        return (new Completer(this)).getCompletions(line, cb)
    },

    // Configuration Methods

    name: function name(name) {
        this.config.name = name
        return this
    },

    description: function description(description) {
        this.config.description = description
        return this
    },

    version: function version(version) {
        this.config.version = version
        return this
    },

    usage: function usage(msg) {
        // msg may be a single string or an array of strings
        this.config.usage = msg
        return this
    },

    nargs: function nargs(min, max) {
        if (typeof min !== 'undefined' && typeof max === 'undefined') {
            // single arg case
            if (min >= 0) {
                this.nargsMin = min
                this.nargsMax = min
            }
        } else if (typeof min !== 'undefined' && typeof max !== 'undefined') {
            // double arg case
            if (min >= 0) {
                this.nargsMin = min
            }
            if (max >= 0) {
                if (max < min) {
                    throw new ClickError('max must be >= min')
                }
                this.nargsMax = max
            }
        } else {
            throw new ClickError('no arguments provided')
        }

        return this
    },

    option: function option(name, config) {
        var opt = new Option(name, config)
        this.optNames[name] = opt

        // Register config for all names
        _.forEach(opt.getAliases(), _.bind(function(label) {
            this.options[label] = opt
        }, this))

        // Register in other lookups
        if (opt.isRequired()) {
            this.requiredOpts[name] = true
        }
        if (opt.hasDefaultValue()) {
            this.optDefaults[name] = true
        }

        return this
    },

    optionSet: function optionSet(configs) {
        _.forEach(configs, _.bind(function(config, key) {
            this.option(key, config)
        }, this))
        return this
    },

    command: function command(name, context) {
        var cmd = new Command(name, this, context)
        this.commands[name] = cmd

        return this
    },

    handler: function handler(cb) {
        if (typeof cb !== 'function') {
            throw new ClickError('handler must be a function')
        }
        this.handlerFn = cb

        return this
    },

    // Getters

    getName: function getName() {
        return this.config.name
    },

    getDescription: function getDescription() {
        return this.config.description
    },

    getVersion: function getVersion() {
        return this.config.version
    },

    getUsage: function getUsage() {
        if (this.config.usage) {
            return this.config.usage.replace(/\$((\{(NAME|0|PROG)\})|(NAME|0|PROG))/g, this.getName())
        } else {
            return undefined
        }
    },

    getMinArgs: function getMinArgs() {
        return this.nargsMin
    },

    getMaxArgs: function getMaxArgs() {
        return this.nargsMax
    },

    getOptionNames: function getOptionNames() {
        return Object.keys(this.options)
    },

    getRequiredOptions: function getRequiredOptions() {
        return this.requiredOpts
    },

    getCommandNames: function getCommandNames() {
        return Object.keys(this.commands)
    },

    getCommand: function getCommand(command) {
        var context = this
        var result
        var commands = command.split(Parser.COMMAND_DELIM)
        _.forEach(commands, function(token) {
            if (!(token in this.commands)) {
                throw new ClickError('Invalid command: ' + token)
            }
            result = context.commands[token]
            context = result.context
        })
        return result
    },

    getHandler: function getHandler() {
        return this.handlerFn
    },

    getHelp: function getHelp() {
        return (new Help(this)).getHelp()
    },

})

_.extend(Click, {
    parse: function parse(argv) {
        return new Click().parse(argv)
    }
})

module.exports = Click
