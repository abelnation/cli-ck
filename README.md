# cli-ck

CLI framework for Node.js that's qui-ck and easy

cli-ck provides a simple and flexible interface for creating cli apps in Node.js.

## Synopsis

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
    .command('say', { desc: 'Say words in different ways' }, function(sayCli) {
        sayCli
            .usage('$0 say [--volume {soft,medium,loud}] <...words>')
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
    })
    .handler(function(args, opts) {
        console.log('please choose a command')
    })
cli.run(process.argv)
```

In your terminal:

```bash
~$ ./easy.js help
easy.js - demonstrates the cli-ck module
version: 1.0.0

Commands:

  help  -  print help
  say  -  Say words in different ways

Options:

  version  -  print version
  help  -  print help
  fruit  -  Type of fruit

~$ ./easy.js help say
easy.js say - Say words in different ways
version: 1.0.0
usage: $0 say [--volume {soft,medium,loud}] <...words>

Commands:

  help  -  print help

Options:

  version  -  print version
  help  -  print help
  volume  -  how loud do you want to say it? [loud, medium, soft]

~$ ./easy.js say hi there
hi there

~$ ./easy.js say -v loud hey out there
HEY OUT THERE
```

## Summary

* Simple, chaining interface for easy and clear cli specification
* Batteries included!
    * Auto-generated help/usage output
    * Default commands & options provided (`help`, `exit`, `--version`, `--help`)
    * Robust validation of commands, options, and argument values
    * Auto-included repl allows you to run your cli as an interactive repl
