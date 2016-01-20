
let Click
class CommandError extends Error {}

class Command {
    constructor(name, config, parentContext, setupContext) {

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
        let {
            description,
            describe,
            desc
        } = config

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
        const contextName = `${ parentContext.getName() } ${ this.getName() }`
        this.context.name(contextName)
        this.context.description(this.getDescription())
        this.context.version(parentContext.getVersion())

    }

    getName() { return this.name }
    getDescription() { return this.description }
    getContext() { return this.context }
}

module.exports = Command
