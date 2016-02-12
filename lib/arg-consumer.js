var _ = require('lodash')
var shellParse = require('shell-quote').parse

function normalizeArgs(args) {
    var result = []

    if (!args) {
        return result
    }

    _.forEach(args, function(arg) {
        if (/^--/.test(arg)) {
            result.push(arg)
        } else if (/^-$/.test(arg)) {
            // treat a lone hyphen as an arg, not an option
            result.push(arg)
        } else if (/^-/.test(arg)) {
            var options = arg.replace(/^-/, '')
            _.forEach(options, function(option) {
                if (!/[a-zA-Z]/.test(option)) {
                    throw new Error('invalid short option: ' + option)
                }
                result.push('-' + option)
            })
        } else {
            result.push(arg)
        }
    })

    return result
}

function ArgConsumer(args) {
    if (typeof args === 'undefined') {
        args = []
    }

    if (typeof args === 'string') {
        args = shellParse(args)
    }

    if (typeof args !== 'object') {
        throw new ClickError('Invalid argv value')
    }

    this.args = normalizeArgs(args)
    this.current = this.args.slice(0)

    // console.log('ArgConsumer')
    // console.dir(this)
}

_.extend(ArgConsumer.prototype, {
    peek: function peek(num) {
        if (typeof num === 'undefined') {
            return this.current[0]
        }

        if (typeof num !== 'number' || num < 0) {
            throw new Error('num must be >= 0')
        }

        num = Math.min(num, this.current.length)
        return this.current.slice(0, num)
    },

    peekLast: function peekLast(num) {
        if (typeof num === 'undefined') {
            return this.current[this.current.length - 1]
        }

        if (typeof num !== 'number' || num < 0) {
            throw new Error('num must be >= 0')
        }

        num = Math.min(num, this.current.length)
        return this.current.slice(this.current.length - num, this.current.length)
    },

    next: function next(num) {
        var result
        if (num) {
            result = this.current.slice(0, num)
            this.current = this.current.slice(num)
        } else {
            result = this.current[0]
            this.current = this.current.slice(1)
        }
        return result
    },

    hasNext: function hasNext() {
        return this.current.length > 0
    },

    numRemaining: function numRemaining() {
        return this.current.length
    },
})

_.extend(ArgConsumer, {
    cleanArgv: function cleanArgv(argv) {
        if (!argv) {
            return new ArgConsumer()
        }

        if (argv.constructor !== ArgConsumer) {
            return new ArgConsumer(argv)
        }
        return argv
    },

    shellParse: function shellParse(argv) {
        if (typeof argv !== 'string') {
            throw new Error('shellParse only takes strings')
        }
        return shellParse(argv)
    },
})

module.exports = ArgConsumer
