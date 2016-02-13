var Click = require('../../cli-ck')

var fixture = new Click()
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
    .command('foo', function(parser) {
        parser
            .description('foo command')
            .option('fooopt', { alias: 'f' })
            .command('foo2', new Click().description('foo2 subcommand'))
    })
    .command('bar', function(parser) {
        parser
            .description('bar command')
            .option('baropt', { alias: 'b' })
    })

module.exports = fixture

if (require.main === module) {
    fixture.run(process.argv)
}
