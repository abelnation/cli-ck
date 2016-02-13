#!/usr/bin/env node

var Click = require('../lib/cli-ck')

function fibo(nelems) {
    var e1 = 0
    var e2 = 1
    var tmp
    console.log(e1)
    console.log(e2)

    for (var i = 0; i < nelems - 2; i++) {
        tmp = e1 + e2
        e1 = e2
        e2 = tmp
        console.log(e2)
    }
}

var cli = new Click()
    .usage('$0 -n <num_elems> [--verbose -v]')
    .version('1.0.0')
    .option('verbose', {
        alias: 'V',
        desc: 'print verbose output'
    })
    .option('nelems', {
        alias: [ 'n', 'num-elems' ],
        desc: 'num of fibo elems to print',
        number: true,
        defaultValue: 10
    })
    .handler(function doFibo(args, opts) {
        var nelems = opts.nelems
        fibo(nelems)
    })
cli.run(process.argv.slice(2))
