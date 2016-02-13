#!/usr/bin/env node

var Click = require('../../cli-ck')

var fixture = new Click()
    .option('fruit', {
        alias: 'f',
        choices: [ 'apple', 'banana', 'peach', 'pear', 'plumb' ]
    })
    .option('aaa')
    .option('abb')
    .option('bba')
    .option('cba')
    .command('foo', function(parser) {
        parser
            .description('foo command')
            .option('vegetable', {
                alias: [ 'v', 'veggie' ],
                choices: [ 'broccoli', 'carrot', 'cucumber', 'zucchini' ]
            })
            .option('xxx')
            .option('xyy')
            .option('xyz')
            .handler(function(args, opts) {
                console.log('vegetable!')
            })
    })
    .command('foobar')
    .command('foobaz')
    .handler(function(args, opts) {
        console.log('default')
    })

module.exports = fixture

if (require.main === module) {
    fixture.run(process.argv)
}
