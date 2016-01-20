# cli-ck

CLI framework for Node.js that's qui-ck and easy

`cli-ck` provides a simple and flexible interface for creating cli apps in Node.js.
Inspired by the Yargs api, `cli-ck` provides an API that is flexible and composeable
making it a breeze to write simple cli tools or complex interactive repl's.

1. [Synopsis](#synopsis)
1. [API Reference](#api-reference)
1. [Development](#development)

<a name="synopsis" />
## Synopsis

```
npm install cli-ck
```

`easy.js`

```javascript
#!/usr/bin/env node
require('babel-polyfill')
var Click = require('../lib/cli-ck')
var cli = new Click()
    .description('demonstrates the cli-ck module')
    .version('1.0.0')
    .option('fruit', {
        alias: 'f',
        desc: 'Type of fruit',
        choices: [ 'apple', 'banana', 'peach', 'pear' ]
    })
    .command('say', { desc: 'Say words in different ways' }, require('./say'))
    .handler(function(args, opts) {
        console.log('please choose a command')
    })
cli.run(process.argv)
```

`say.js`

```javascript
#!/usr/bin/env node
require('babel-polyfill')
var Click = require('../lib/cli-ck')
var cli = new Click()
    .usage('$0 [--volume {soft,medium,loud}] <...words>')
    .option('volume', {
        alias: 'v',
        desc: 'how loud do you want to say it? [loud, medium, soft]',
        choices: [ 'loud', 'medium', 'soft' ],
        defaultValue: 'medium'
    })
    .handler(function (args, opts) {
        if (opts.volume === 'loud') {
            args = args.map(function(x) { return x.toUpperCase() })
        } else if (opts.volume === 'soft') {
            args = args.map(function(x) { return x.toLowerCase() })
        }
        console.log.apply(null, args)
    })
module.exports = cli
if (require.main === module) {
    cli.run(process.argv.slice(2))
}
```

Try these in your terminal:

```bash
~$ chmod u+x ./easy.js
~$ ./easy.js help
~$ ./easy.js help say
~$ ./easy.js say hi there
~$ ./easy.js say -v loud hey out there
~$ ./easy.js --repl
> help
> say hi
> exit
~$
```

## Summary

* Simple, chaining interface for easy and clear cli specification
* Batteries included!
    * Auto-generated help/usage output
    * Default commands & options provided (`help`, `exit`, `--version`, `--help`)
    * Robust validation of commands, options, and argument values
    * Auto-included repl allows you to run your cli as an interactive repl

<a name="api-reference" />
## API

#### `var Click = require('cli-ck')`

#### `new Click(config)`

Creates a new Click instance.

* `config` (optional):
    * `noHelp`:  set to true to exclude help command

#### `.parse(argv)`

Parses a line and returns a `parseResult`

##### Parameters

- `argv` - CLI input to parse
    - expects `string`, `array`, or instance of `ArgConsumer` (internal class used for parsing)

##### Returns:

Most often you just want the args and opts parsed.
`parse` returns an Object of the form:

```
{
    args: [... non-option arguments ...],
    opts: {... dict of optName: optValue ...},
    command: string of full command e.g. 'say loudly',
    context: <Click instance used to parse>
    lastContext: <Click instance for actually executing command>
}
```

#### `.run(argv)`

Parses and runs the CLI handler for the given input.
`run` will only the handler for the lowest-down sub-command parsed from the input.

##### Parameters

- `argv` - CLI input to parse
    - expects a `string`, or an `array` of strings

#### `.repl(argv)`

Starts an interactive repl session using the Click instance's cli specification.
Each line submitted will execute `Click.run()` on the line, and print the results.

Click has built-in tab-completion in the repl context.  Click will do best effort
completion for the following:

* command names
* option names
* option values (for options with choices specified)

You can also enter the repl mode by passing the `--repl` in your input to `.run()`

#### `.validate(argv)`

#### `.complete(argv)`

### CLI Metadata

Note that all methods from here down can be chained (i.e. they all return the Click instance)

#### `.name(name)`

#### `.description(desc)`

#### `.version(versionStr)`

#### `.usage(usageStr)`

#### `.nargs(min, max)`

#### `.handler(handlerFn)`

##### Parameters

- `handlerFn`: Handler function called when Click.run() is called
    - `function cb(args, opts, argv, context, finalContext) { ... }`

### Options

#### `.option(name, config)`

##### Parameters

- `name` - name of option
- `config` - dict of configs for this option (see below)

Option's support the following config keys:

- `demand`/`required` - Option is required.  Calling run without opt value will throw error.
- `desc`/`describe`/`description` - Text description of option's purpose
- `alias` - Either `string` or `array` of alternate names for option.
- `choices` - `array` of string or number values allowed for the option.
- `defaultValue` - value assigned to option if not specified
- `type` - `string`, `count`, `boolean`, or `number`
- `boolean` - set to true to set type to `boolean`
- `count` - set to true to set type to `count`
- `number` - set to true to set type to `number`
- `string` - set to true to set type to `string`

#### `.optionSet(configs)`

### Sub-Commands

Click provides sophisticated support for sub-commands and an API that lets you
easily compose multiple sub-cli's together to nest your commands as deep as you want.

When parsing a line, once a command token is encountered, the parser uses the commands
context to parse the rest of the line.  This means, e.g. that your commands can be
configured to support or require options that your top level program does not.

#### `.command(name, config, context)`

Registers a command name with a given context.

##### Parameters

- `name` - name of command
- `config` - dict of configs for this option (see below)
- `context` - CLI context for your sub-command
    - expects either `function(cli) {}` or a `Click` instance

Commands's support the following config keys:

- `desc`/`describe`/`description` - Text description of option's purpose

##### Example

```
var cli = new Click()
    // passing in a Click instance as `context`
    .command('foo', { 'desc': 'foo command' }, new Click()
        .handler(function(args, opts) {
            console.log('foo')
        }))
    // passing in a setupFn as `context`
    .command('bar', { 'desc': 'bar command' }, function(barCli) {
        barCli.handler(function(args, opts) {
            console.log('bar')
        }
    })
```

You could also define and export your commands' sub-cli's in separate modules to make
your top-level module much cleaner.

```
var cli = new Click()
    // passing in a Click instance as `context`
    .command('foo', { 'desc': 'foo command' }, require('./commands/foo')))
    .command('bar', { 'desc': 'bar command' }, require('./commands/bar')))
```

<a name="development" />
## Development

All source code is written in ES6 javascript and compiled using Babel
with the `es2015` preset.

Main dev commands:

```
# setup
npm install

# compile src
npm run build

# watch src files and re-build on change
npm run watch

# run tests, outputs result to mocha-test.html
npm test

# watch compiled files, and re-run tests on change
npm run testwatch
```
