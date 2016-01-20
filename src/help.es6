
let Click
const Parser = require('./parser')

class Help {
    constructor(context) {
        this.context = context
    }

    getHelp() {
        return [].concat(
            this.getHeader(),
            this.getCommands(),
            this.getOptions()
        ).join('\n')
    }

    getHeader() {
        const result = [ '' ]

        const name = this.context.getName()
        const description = this.context.getDescription()
        if (name) {
            result.push(name + (description ? ` - ${ description }` : ''))
        }

        const version = this.context.getVersion()
        if (version) {
            result.push(`version: ${ version }`)
        }

        const usage = this.context.getUsage()
        if (usage) {
            if (typeof usage === 'string') {
                result.push(`usage: ${ this.context.getUsage() }`)
            } else if (typeof usage === 'object') {
                for (let i = 0; i < usage.length; i++) {
                    const prefix = (i === 0) ? 'Usage:' : '      '
                    result.push(`${ prefix } ${ usage[i] }`)
                }
            }

        }
        if (result.length > 0) {
            result.push('')
        }
        return result
    }

    getCommands() {
        if (this.context.getCommandNames().length === 0) {
            return []
        }
        const cmdLines = this.context.getCommandNames().map(cmdName => {
            const cmd = this.context.commands[cmdName]
            return `  ${ cmd.getName() }  -  ${ cmd.getDescription() }`
        })
        return [
            'Commands:',
            '',
            ... cmdLines,
            ''
        ]
    }

    getOptions() {
        if (this.context.getOptionNames().length === 0) {
            return []
        }
        const optLines = Object.keys(this.context.optNames).map(optName => {
            const opt = this.context.options[optName]
            return `  ${ opt.getName() }  -  ${ opt.getDescription() }`
        })
        return [
            'Options:',
            '',
            ... optLines
        ]
    }

    static getHelpCommandContext() {
        // handle circular dependency
        if (!Click) { Click = require('./cli-ck') }

        return new Click({ noHelp: true })
            .handler((args, opts, argv, context, lastContext) => {
                // parse line after 'help' to figure out command context
                // to print help for
                const parseResult = (new Parser(context)).parse(argv.slice(1))
                const cmdContext = parseResult.lastContext

                const helpText = new Help(cmdContext).getHelp()
                console.log(helpText)
            })
    }
}

module.exports = Help
