
const _ = require('lodash')
const repl = require('repl')
const path = require('path')
const ArgConsumer = require('./arg-consumer')
const Option = require('./option')
const Command = require('./command')
const Completer = require('./completer')
const Parser = require('./parser')
const Validator = require('./validator')
const Help = require("./help")

class ClickError extends Error {}

class Click {
    constructor(config) {
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
        const mainPath = require.resolve(require.main.filename)
        if (mainPath) {
            const mainTokens = mainPath.split(path.sep)
            this.config.name = mainTokens[mainTokens.length - 1]
        }

        this.option('version', { alias: 'v', desc: 'print version' })
        this.option('help', { alias: [ 'h', 'H' ], desc: 'print help' })

        const noHelp = config ? config.noHelp : false
        if (!noHelp) {
            this.command('help', { description: 'print help' }, Help.getHelpCommandContext())
        }
    }

    // Main methods
    parse(argv, cb) {
        const parseResult = (new Parser(this)).parse(argv, cb)

        if (cb) {
            return cb(null, parseResult)
        } else {
            return parseResult
        }
    }

    run(argv, cb) {
        argv = ArgConsumer.cleanArgv(argv)

        const parseResult = (new Parser(this)).parse(argv, cb)
        if (parseResult.opts.repl) {
            return this.repl(argv, cb)
        }

        try {
            const isValid = (new Validator(this)).validate(parseResult)
            if (!isValid) {
                console.error('Error: Invalid input')
                return
            }
        } catch (e) {
            console.error(`Error: ${ e.message }`)
            return
        }

        const lastContext = parseResult.lastContext
        const handler = lastContext.getHandler()

        if (handler && typeof handler === 'function') {
            const args = parseResult.args
            const opts = parseResult.opts

            if (opts.help) {
                console.log(lastContext.getHelp())
            } else if (opts.version) {
                console.log(`Version: ${ this.config.version }`)
            } else {
                handler(args, opts, argv.args, this, lastContext)
            }
        } else {
            console.log(lastContext.getHelp())
        }
    }

    repl(argv, cb) {
        // start repl
        this.command('exit', { desc: 'exit the program' }, new Click().handler(() => {
            process.exit(0)
        }))

        const server = repl.start({
            prompt: '> ',
            eval: (line, nodeContext, filename, callback) => {
                line = line.slice(1,-2)
                this.run(line)
                server.displayPrompt()
            },
        })

        // backup original complete fn
        server._complete = server.complete

        // assign repl completion fn
        server.complete = Completer.getReplTabCompleteCallback(this)
    }

    validate(line, cb) {
        return (new Validator(this)).validate(line)
    }

    complete(line, cb) {
        return (new Completer(this)).getCompletions(line, cb)
    }

    // Configuration Methods

    name(name) {
        this.config.name = name
        return this
    }

    description(description) {
        this.config.description = description
        return this
    }

    version(version) {
        this.config.version = version
        return this
    }

    usage(msg) {
        // msg may be a single string or an array of strings
        this.config.usage = msg
        return this
    }

    nargs(min, max) {
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
    }

    option(name, config) {
        const opt = new Option(name, config)
        this.optNames[name] = opt

        // Register config for all names
        for (let label of opt.getAliases()) {
            this.options[label] = opt
        }

        // Register in other lookups
        if (opt.isRequired()) {
            this.requiredOpts[name] = true
        }
        if (opt.hasDefaultValue()) {
            this.optDefaults[name] = true
        }

        return this
    }

    optionSet(configs) {
        for (let key in configs) {
            const config = configs[key]
            this.option(key, config)
        }
        return this
    }

    command(name, config, context) {
        const cmd = new Command(name, config, this, context)
        this.commands[name] = cmd

        return this
    }

    handler(cb) {
        if (typeof cb !== 'function') {
            throw new ClickError('handler must be a function')
        }
        this.handlerFn = cb

        return this
    }

    // Getters

    getName() {
        return this.config.name
    }

    getDescription() {
        return this.config.description
    }

    getVersion() {
        return this.config.version
    }

    getUsage() {
        return this.config.usage.replace(/\$((\{(NAME|0|PROG)\})|(NAME|0|PROG))/g, this.getName())
    }

    getMinArgs() {
        return this.nargsMin
    }

    getMaxArgs() {
        return this.nargsMax
    }

    getOptionNames() {
        return Object.keys(this.options)
    }

    getRequiredOptions() {
        return this.requiredOpts
    }

    getCommandNames() {
        return Object.keys(this.commands)
    }

    getCommand(command) {
        let context = this
        let result
        const commands = command.split(Parser.COMMAND_DELIM)
        for (let token of commands) {
            if (!(token in this.commands)) {
                throw new ClickError('Invalid command: ' + token)
            }
            result = context.commands[token]
            context = result.context
        }
        return result
    }

    getHandler() {
        return this.handlerFn
    }

    getHelp() {
        return (new Help(this)).getHelp()
    }

    // Static methods

    static parse(argv) {
        return new Click().parse(argv)
    }

}

module.exports = Click
