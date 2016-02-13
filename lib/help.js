
var _ = require('lodash')
var Parser = require('./parser')

var Click

function Help(context) {
    this.context = context
}

_.extend(Help.prototype, {
    getHelp: function getHelp() {
        return [].concat(
            this.getHeader(),
            this.getCommands(),
            this.getOptions()
        ).join('\n')
    },

    getHeader: function getHeader() {
        var result = [ '' ]

        var name = this.context.getName()
        var description = this.context.getDescription()
        if (name) {
            result.push(name + (description ? ' - ' + description : ''))
        }

        var version = this.context.getVersion()
        if (version) {
            result.push('version: ' + version)
        }

        var usage = this.context.getUsage()
        if (usage) {
            if (typeof usage === 'string') {
                result.push('usage: ' + this.context.getUsage())
            } else if (typeof usage === 'object') {
                for (var i = 0; i < usage.length; i++) {
                    var prefix = (i === 0) ? 'Usage:' : '      '
                    result.push(prefix + ' ' + usage[i])
                }
            }
        }
        if (result.length > 0) {
            result.push('')
        }
        return result
    },

    getCommands: function getCommands() {
        if (this.context.getCommandNames().length === 0) {
            return []
        }
        var cmdLines = this.context.getCommandNames().map(_.bind(function(cmdName) {
            var cmd = this.context.commands[cmdName]
            return '  ' + cmd.getName() + '  -  ' + cmd.getDescription()
        }, this))

        var result = [ 'Commands:' ]
        result = result.concat(cmdLines)
        result.push('')

        return result
    },

    getOptions: function getOptions() {
        if (this.context.getOptionNames().length === 0) {
            return []
        }
        var optLines = Object.keys(this.context.optNames).map(_.bind(function(optName) {
            var opt = this.context.options[optName]
            return '  ' + opt.getName() + '  -  ' + opt.getDescription()
        }, this))

        var result = [ 'Options:' ]
        result = result.concat(optLines)

        return result
    },
})

_.extend(Help, {
    getHelpCommandContext: function getHelpCommandContext() {
        // handle circular dependency
        if (!Click) { Click = require('./cli-ck') }

        return new Click({ noHelp: true })
            .description('print help')
            .handler(function(args, opts, argv, parentContext, lastContext) {
                // parse line after 'help' to figure out command context
                // to print help for

                var helpIdx = argv.indexOf('help')

                var parseResult = (new Parser(parentContext)).parse(argv.slice(helpIdx + 1))
                var cmdContext = parseResult.lastContext

                var helpText = new Help(cmdContext).getHelp()
                console.log(helpText)
            })
    },
})

module.exports = Help
