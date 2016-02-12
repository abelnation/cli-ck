
var _ = require('lodash')
var util = require('util')
var Click

function CommandError(message) {
    Error.call(this)
    this.message = message
}
util.inherits(CommandError, Error)

function Command(name, config, parentContext, setupContext) {
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

    if (!config) {
        config = {}
    }

    var description = config.description
    var describe = config.describe
    var desc = config.desc

    this.description = description || describe || desc

    this.parentContext = parentContext
    if (setupContext && setupContext.constructor === Click) {
        // can pass in a pre-constructed yargs object as context
        this.context = setupContext
    } else {
        // or can pass a configurator fn that takes a blank yargs object
        this.context = new Click()
        if (typeof setupContext === 'function') {
            setupContext(this.context)
        }
    }

    // TODO: check if explicitly set before inheriting
    var contextName = parentContext.getName() + ' ' + this.getName()
    this.context.name(contextName)
    this.context.description(this.getDescription())
    this.context.version(parentContext.getVersion())
}

_.extend(Command.prototype, {
    getName: function getName() {
        return this.name
    },

    getDescription: function getDescription() {
        return this.description
    },

    getContext: function getContext() {
        return this.context
    },
})

module.exports = Command
