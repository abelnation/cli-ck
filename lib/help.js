
var _ = require('lodash')
var Parser = require('./parser')

var Click

function Help(context) {
    this.context = context
}

function strRepeat(str, count) {
    return _.reduce(_.times(count), function(result) {
        return result + str
    }, '')
}

function padStrings(strings, padStr) {
    var maxLen = _.reduce(strings, function(result, str) {
        return Math.max(result, str.length)
    }, 0)
    return _.map(strings, function(str) {
        var padLen = maxLen - str.length
        return str + strRepeat(padStr, padLen)
    })
}

_.extend(Help.prototype, {
    getHelp: function getHelp() {
        return [].concat(
            this.getHeader(),
            'Commands:',
            this.getCommands(),
            'Options:',
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

        var allCommandNames = this.context.getDeepCommandNames().sort()
        var paddedCommandNames = padStrings(allCommandNames, ' ')

        var maxCmdLength = _.reduce(allCommandNames, function(result, cmdName) {
            return Math.max(result, cmdName.length)
        }, 0)

        var cmdLines = _.map(allCommandNames, _.bind(function(cmdName, index) {
            var cmd = this.context.getCommand(cmdName)
            if (cmd) {
                return '  ' + paddedCommandNames[index] + ' -  ' + cmd.getDescription()
            }
        }, this))

        var result = cmdLines
        result.push('')

        return result
    },

    getOptions: function getOptions() {
        if (this.context.getOptionNames().length === 0) {
            return []
        }

        // sort option names, put help/version at the end
        var optNames = _.without(_.keys(this.context.optNames), 'help', 'version').sort()
        optNames.push('version', 'help')

        var paddedOptionNames = padStrings(optNames, ' ')

        var optLines = optNames.map(_.bind(function(optName, index) {
            var opt = this.context.options[optName]
            return '  ' + paddedOptionNames[index] + ' -  ' + opt.getDescription()
        }, this))

        return optLines
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
