#!/usr/bin/env node
require('babel-polyfill')
var Click = require('../../cli-ck')

var sayCmd = new Click()
    .usage('$0 say [--volume {soft,medium,loud}] <...words>')
    .option('volume', {
        alias: 'v',
        choices: [ 'loud', 'medium', 'soft' ],
        defaultValue: 'medium'
    })
    .handler((args, opts) => {
        if (opts.volume === 'loud') {
            args = args.map(x => x.toUpperCase())
        } else if (opts.volume === 'soft') {
            args = args.map(x => x.toLowerCase())
        }
        console.log.apply(null, args)
    })

var countCmd = new Click()
    .usage('$0 count <...num>')
    .handler(function(args, opts) {
        for (var i = 0; i < args.length; i++) {
            const num = args[i]
            let countStr = ''
            for (var j = 1; j <= num; j++) {
                countStr += `${ countStr.length > 0 ? ',' : '' }${ j }`
            }
            console.log(`${ num }: ${ countStr }`)
        }
    })

var fixture = new Click()
    .version('0.0.1')
    .description('example program to demonstrate use of commands')
    .command('say', { description: 'say some things' }, sayCmd)
    .command('count', { description: 'count to n' }, countCmd)
    .handler(function (args, opts, argv, context, lastContext) {
        console.log('Error: please use a command')
        console.log(context.getHelp())
    })

module.exports = fixture

if (require.main === module) {
    fixture.run(process.argv.slice(2))
}
