#!/usr/bin/env node
'use strict';

require('babel-polyfill');
var Click = require('../../cli-ck');

var fixture = new Click().option('fruit', {
    alias: 'f',
    choices: ['apple', 'banana', 'peach', 'pear', 'plumb']
}).option('aaa').option('abb').option('bba').option('cba').command('foo', { description: 'foo command' }, function (parser) {
    parser.option('vegetable', {
        alias: ['v', 'veggie'],
        choices: ['broccoli', 'carrot', 'cucumber', 'zucchini']
    }).option('xxx').option('xyy').option('xyz').handler(function (args, opts) {
        console.log('vegetable!');
    });
}).command('foobar', { description: 'foo command' }).command('foobaz', { description: 'foo command' }).handler(function (args, opts) {
    console.log('default');
});

module.exports = fixture;

if (require.main === module) {
    fixture.run(process.argv);
}
//# sourceMappingURL=basic-completion.js.map