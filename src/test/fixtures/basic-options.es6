const Click = require('../../cli-ck')

let fixture = new Click()
    .optionSet({
        'ex-count': {
            alias: 'c',
            count: true
        },
        'ex-number': {
            alias: 'n',
            number: true,
        },
        'ex-string': {
            alias: 's',
            string: true,
        },
        'ex-boolean': {
            alias: 'b',
            boolean: true
        }
    })
    .command('foo', { description: 'foo command' }, (parser) => {
        parser
            .option('fooopt', { alias: 'f' })
            .command('foo2', { description: 'foo2 subcommand' })
    })
    .command('bar', { description: 'bar command' }, (parser) => {
        parser.option('baropt', { alias: 'b' })
    })

module.exports = fixture

if (require.main === module) {
    fixture.run(process.argv)
}
