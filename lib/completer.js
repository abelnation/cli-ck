
var _ = require('lodash')
var Parser = require('./parser')
var Option = require('./option')
var ArgConsumer = require('./arg-consumer')

function getReplTabCompletions(line, callback) {

    // console.log('')

    var result = new Completer(this).getCompletions(line)

    // console.log(`completion result`)
    // console.log(`  completions: ${ completions }`)
    // console.log(`  toComplete: ${ tokenToComplete }`)

    return callback(null, [ result.completions, result.tokenToComplete ])
}

function Completer(context) {
    this.context = context
}

_.extend(Completer.prototype, {
    getCompletions: function getCompletions(line, cb) {

        // console.log(`getCompletions: ${ line }`)

        var argv = ArgConsumer.cleanArgv(line)

        var lastChar = line.charAt(line.length - 1)
        var lastTokenIsEmpty = (lastChar === '' || lastChar === ' ')
        var hasPreviousToken = (argv.numRemaining() >= (lastTokenIsEmpty ? 1 : 2))

        // console.log(`lastTokenIsEmpty: ${ lastTokenIsEmpty }`)
        // console.log(`hasPreviousToken: ${ hasPreviousToken }`)

        var tokensMinusCurrent
        if (hasPreviousToken) {
            tokensMinusCurrent = lastTokenIsEmpty ? argv.current : argv.current.slice(0, -1)
        } else {
            tokensMinusCurrent = []
        }

        // console.log(`tokensMinusCurrent: ${ tokensMinusCurrent }`)

        var partialParseResult = new Parser(this.context).parse(tokensMinusCurrent)
        var lastContext = partialParseResult.lastContext

        // console.log(`tokensMinusCurrent: ${ tokensMinusCurrent }`)

        var optionNames = lastContext.getOptionNames()
        var commandNames = lastContext.getCommandNames()

        // console.log(`options: ${ optionNames }`)

        var prevToken
        if (hasPreviousToken) {
            if (lastTokenIsEmpty) {
                prevToken = argv.peekLast()
            } else {
                prevToken = argv.peekLast(2)[0]
            }
        }

        // console.log(`prevToken: ${ prevToken }`)
        var toComplete = lastTokenIsEmpty ? '' : argv.peekLast()

        // console.log(line)
        // console.log(`toComplete: '${ toComplete }'`)
        // console.log(`hasPreviousToken: ${ hasPreviousToken }`)
        // console.log(`lastTokenIsEmpty: ${ lastTokenIsEmpty }`)
        // console.log(`prevToken: '${ prevToken }'`)
        // console.log(`argv:`)
        // console.dir(argv)

        var completions = this.getMatchesWithChoices(toComplete, commandNames)

        if (/^--/.test(toComplete)) {
            // console.log('matching long option...')
            // complete long option name
            completions = this.getMatchesWithChoices(toComplete.replace(/^--/, ''), optionNames)
                .map(function(x) { return '--' + x })
        } else if (/^-$/.test(toComplete)) {
            // console.log('matching long option with single hyphen...')
            // treat '-' as a special case
            completions = optionNames.map(function(x) { return '--' + x })
        } else if (/^-/.test(toComplete)) {
            // console.log('skipping matching of short option')
            // don't attempt to complete short opts, since they can
            // be combined together into one long string e.g. '-abcv'
            completions = []
        } else if (hasPreviousToken) {
            // check to see if argument for previous option
            if (/^-/.test(prevToken)) {
                // console.log('matching value for previous option...')

                var prevOption = this.context.options[prevToken.replace(/^-(-?)/, '')]
                if (prevOption.choices &&
                    (prevOption.type === Option.Type.String || prevOption.type === Option.Type.Number)) {
                    completions = this.getMatchesWithChoices(toComplete, prevOption.choices)
                }
            }
        }

        var result = {
            line: line,
            completions: completions,
            tokenToComplete: toComplete
        }

        if (cb) {
            return cb(null, result)
        } else {
            return result
        }
    },

    getMatchesWithChoices: function getMatchesWithChoices(partial, choices) {
        return choices.filter(function(choice) {
            return (new RegExp('^' + partial)).test(choice)
        })
    },
})

_.extend(Completer, {
    getReplTabCompleteCallback: function getReplTabCompleteCallback(context) {
        return getReplTabCompletions.bind(context)
    }
})

module.exports = Completer
