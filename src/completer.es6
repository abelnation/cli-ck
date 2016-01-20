const Parser = require('./parser')
const Option = require('./option')
const ArgConsumer = require('./arg-consumer')

function getReplTabCompletions(line, callback) {

    // console.log('')

    const { completions, tokenToComplete } = new Completer(this)
        .getCompletions(line)

    // console.log(`completion result`)
    // console.log(`  completions: ${ completions }`)
    // console.log(`  toComplete: ${ tokenToComplete }`)

    return callback(null, [ completions, tokenToComplete ])
}

class Completer {
    constructor(context) {
        this.context = context
    }

    getCompletions(line, cb) {

        // console.log(`getCompletions: ${ line }`)

        let argv = ArgConsumer.cleanArgv(line)

        const lastChar = line.charAt(line.length - 1)
        const lastTokenIsEmpty = (lastChar === '' || lastChar === ' ')
        const hasPreviousToken = (argv.numRemaining() >= (lastTokenIsEmpty ? 1 : 2))

        // console.log(`lastTokenIsEmpty: ${ lastTokenIsEmpty }`)
        // console.log(`hasPreviousToken: ${ hasPreviousToken }`)

        let tokensMinusCurrent
        if (hasPreviousToken) {
            tokensMinusCurrent = lastTokenIsEmpty ? argv.current : argv.current.slice(0, -1)
        } else {
            tokensMinusCurrent = []
        }

        // console.log(`tokensMinusCurrent: ${ tokensMinusCurrent }`)

        const partialParseResult = new Parser(this.context).parse(tokensMinusCurrent)
        const lastContext = partialParseResult.lastContext

        // console.log(`tokensMinusCurrent: ${ tokensMinusCurrent }`)

        const optionNames = lastContext.getOptionNames()
        const commandNames = lastContext.getCommandNames()

        // console.log(`options: ${ optionNames }`)

        let prevToken
        if (hasPreviousToken) {
            if (lastTokenIsEmpty) {
                prevToken = argv.peekLast()
            } else {
                prevToken = argv.peekLast(2)[0]
            }
        }

        // console.log(`prevToken: ${ prevToken }`)
        const toComplete = lastTokenIsEmpty ? '' : argv.peekLast()

        // console.log(line)
        // console.log(`toComplete: '${ toComplete }'`)
        // console.log(`hasPreviousToken: ${ hasPreviousToken }`)
        // console.log(`lastTokenIsEmpty: ${ lastTokenIsEmpty }`)
        // console.log(`prevToken: '${ prevToken }'`)
        // console.log(`argv:`)
        // console.dir(argv)

        let completions = this.getMatchesWithChoices(toComplete, commandNames)

        if (/^--/.test(toComplete)) {
            // console.log('matching long option...')
            // complete long option name
            completions = this.getMatchesWithChoices(toComplete.replace(/^--/, ''), optionNames)
                .map(x => `--${ x }`)
        } else if (/^-$/.test(toComplete)) {
            // console.log('matching long option with single hyphen...')
            // treat '-' as a special case
            completions = optionNames.map(x => `--${ x }`)
        } else if (/^-/.test(toComplete)) {
            // console.log('skipping matching of short option')
            // don't attempt to complete short opts, since they can
            // be combined together into one long string e.g. '-abcv'
            completions = []
        } else if (hasPreviousToken) {
            // check to see if argument for previous option
            if (/^-/.test(prevToken)) {
                // console.log('matching value for previous option...')

                const prevOption = this.context.options[prevToken.replace(/^-(-?)/, '')]
                if (prevOption.choices &&
                    (prevOption.type === Option.Type.String || prevOption.type === Option.Type.Number)) {
                    completions = this.getMatchesWithChoices(toComplete, prevOption.choices)
                }
            }
        }

        const result = {
            line: line,
            completions: completions,
            tokenToComplete: toComplete
        }

        if (cb) {
            return cb(null, result)
        } else {
            return result
        }
    }

    getMatchesWithChoices(partial, choices) {
        return choices.filter(choice => {
            return (new RegExp('^' + partial)).test(choice)
        })
    }

    static getReplTabCompleteCallback(context) {
        return getReplTabCompletions.bind(context)
    }
}

module.exports = Completer
