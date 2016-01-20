'use strict';

var Click = require('../../cli-ck');

var fixture = new Click().optionSet({
    'ex-count': {
        alias: 'c',
        count: true
    },
    'ex-number': {
        alias: 'n',
        number: true
    },
    'ex-string': {
        alias: 's',
        string: true
    },
    'ex-boolean': {
        alias: 'b',
        boolean: true
    }
}).command('foo', { description: 'foo command' }, function (parser) {
    parser.option('fooopt', { alias: 'f' }).command('foo2', { description: 'foo2 subcommand' });
}).command('bar', { description: 'bar command' }, function (parser) {
    parser.option('baropt', { alias: 'b' });
});

module.exports = fixture;

if (require.main === module) {
    fixture.run(process.argv);
}
//# sourceMappingURL=basic-options.js.map