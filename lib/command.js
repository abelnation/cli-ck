
var _ = require('lodash')
var util = require('util')
var Click

function CommandError(message) {
    Error.call(this)
    this.message = message
}
util.inherits(CommandError, Error)

function Command(name, parentContext, setupContext) {
    // handle circular dependency
    if (!Click) {
        Click = require('./cli-ck')
    }

    if (!name) {
        throw new CommandError('name is required')
    }
    if (!parentContext || parentContext.constructor !== Click) {
        throw new CommandError('parentContext required and must be Click instance')
    }
    if (/^_/.test(name)) {
        throw new CommandError('name may not start with "_"')
    }
    this.name = name

    this.parentContext = parentContext
    if (setupContext && setupContext.constructor === Click) {
        // can pass in a pre-constructed yargs object as context
        this.context = setupContext
    } else if (typeof setupContext === 'function') {
        // or can pass a configurator fn that takes a blank yargs object
        this.context = new Click()
        if (typeof setupContext === 'function') {
            setupContext(this.context)
        }
    } else if (typeof setupContext === 'undefined') {
        this.context = new Click()
    } else {
        throw new CommandError('invalid argument given for command context')
    }

    // TODO: check if explicitly set before inheriting
    var contextName = parentContext.getName() + ' ' + this.name
    this.context.name(contextName)
    this.context.version(parentContext.getVersion())
}

_.extend(Command.prototype, {
    getName: function getName() {
        return this.name
    },

    getFullCommandName: function getFullCommandName() {
        return this.context.getName()
    },

    getDescription: function getDescription() {
        return this.context.getDescription()
    },

    getContext: function getContext() {
        return this.context
    },
})

module.exports = Command
