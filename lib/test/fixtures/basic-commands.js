#!/usr/bin/env node

var Click = require('../../cli-ck')

var sayCmd = new Click()
    .description('say some things')
    .usage('$0 say [--volume {soft,medium,loud}] <...words>')
    .option('volume', {
        alias: 'v',
        choices: [ 'loud', 'medium', 'soft' ],
        defaultValue: 'medium'
    })
    .handler(function(args, opts) {
        if (opts.volume === 'loud') {
            args = args.map(function(x) { return x.toUpperCase() })
        } else if (opts.volume === 'soft') {
            args = args.map(function(x) { return x.toLowerCase() })
        }
        console.log.apply(null, args)
    })

var countCmd = new Click()
    .description('count to n')
    .usage('$0 count <...num>')
    .handler(function(args, opts) {
        for (var i = 0; i < args.length; i++) {
            var num = args[i]
            var countStr = ''
            for (var j = 1; j <= num; j++) {
                var comma = countStr.length > 0 ? ',' : ''
                countStr += (comma + j)
            }
            console.log('' + num + ': ' + countStr)
        }
    })

var fixture = new Click()
    .version('0.0.1')
    .description('example program to demonstrate use of commands')
    .command('say', sayCmd)
    .command('count', countCmd)
    .handler(function (args, opts, argv, context, lastContext) {
        console.log('Error: please use a command')
        console.log(context.getHelp())
    })

module.exports = fixture

if (require.main === module) {
    fixture.run(process.argv.slice(2))
}
