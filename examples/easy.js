#!/usr/bin/env node
require('babel-polyfill')
var Click = require('../lib/cli-ck')
var cli = new Click()
    .usage('$0 [--fruit {apple,banana,peach,pear}] ...')
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
