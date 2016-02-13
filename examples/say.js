#!/usr/bin/env node
var Click = require('../lib/cli-ck')
var cli = new Click()
    .name('say')
    .description('Say words in different ways')
    .usage('$0 [--volume {soft,medium,loud}] <...words>')
    .option('volume', {
        alias: 'v',
        desc: 'how loud do you want to say it? [loud, medium, soft]',
        choices: [ 'loud', 'medium', 'soft' ],
        defaultValue: 'medium'
    })
    .command('whisper', new Click()
        .description('shhhh...')
        .handler(function (args, opts) {
            console.log('shhhh...')
        }))
    .handler(function (args, opts) {
        if (opts.volume === 'loud') {
            args = args.map(function(x) { return x.toUpperCase() })
        } else if (opts.volume === 'soft') {
            args = args.map(function(x) { return x.toLowerCase() })
        }
        console.log.apply(null, args)
    })

// This script can be run standalone or
// as a sub-command in another Click instance
module.exports = cli
if (require.main === module) {
    cli.run(process.argv.slice(2))
}

