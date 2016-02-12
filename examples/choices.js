#!/usr/bin/env node

var Click = require('./cli-ck')

var cli = new Click()
    .usage('$0 [--fruit -f <fruit>] [--city -c <city>] [--lucky-number -n <num>]')
    .version('1.0.0')
    .option('fruit', {
        alias: 'f',
        desc: 'fruit of choice...',
        required: true,
        choices: [ 'apple', 'banana', 'pear', 'plumb' ]
    })
    .option('city', {
        alias: 'c',
        desc: 'which city?',
        choices: function(context) {
            return [ 'San Francisco', 'Los Angeles', 'Sacramento' ]
        }
    })
    .option('lucky-number', {
        alias: 'n',
        desc: 'which number is your lucky number?',
        choices: function(context) {
            return
        }
    })
    .handler(function showChoices(args, opts, context) {
        console.log('Fruit: ' + opts.fruit)
        console.log('City: ' + opts.city)
        console.log('Lucky-number: ' + opts.n)
    })

cli.run(process.argv)
