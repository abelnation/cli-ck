#!/usr/bin/env node
var Click = require('../lib/cli-ck')
var cli = new Click()
    .name('easy')
    .description('demonstrates the cli-ck module')
    .usage('$0 [--fruit {apple,banana,peach,pear}] ...')
    .version('1.0.0')
    .option('fruit', {
        alias: 'f',
        desc: 'Type of fruit',
        choices: [ 'apple', 'banana', 'peach', 'pear' ]
    })
    .command('say', require('./say'))
    .handler(function(args, opts) {
        console.log('please choose a command')
    })
cli.run(process.argv.slice(2))
