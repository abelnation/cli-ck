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

In your terminal:

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

Object with keys of form:

```
{
    args: [... non-option arguments ...],
    opts: [... dict of optName: optValue ...],
    command: e.g. 'say loudly',
    context: <Click instance used to parse>
    lastContext: <Click instance for actually executing command>
}
```

#### `.run(argv)`

#### `.repl(argv)`

#### `.validate(argv)`

#### `.complete(argv)`

### CLI Metadata

#### `.name(name)`

#### `.description(desc)`

#### `.version(versionStr)`

#### `.usage(usageStr)`

#### `.nargs(min, max)`

#### `.handler(handlerFn)`

- `handlerFn`: `function cb(args, opts, argv, context, finalContext) { ... }`

### Options

#### `.option(name, config)`

#### `.optionSet(configs)`

### Sub-Commands

#### `.command(name, config, context)`

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
