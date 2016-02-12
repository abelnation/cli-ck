
var assert = require('chai').assert

var ArgConsumer = require('../../arg-consumer')

describe('ArgConsumer', function() {
    describe('constructor', function() {
        it('throws if invalid short option chars passed in', function() {
            assert.throws(function() {
                new ArgConsumer('-a=hello')
            })
            assert.throws(function() {
                new ArgConsumer('-ab3')
            })
            assert.throws(function() {
                new ArgConsumer('-@sdf')
            })
        })
    })
    describe('numRemaining', function() {
        it('defaults to zero', function() {
            var result = new ArgConsumer()
            assert.equal(result.numRemaining(), 0)
        })
        it('works for simple args', function() {
            var result = new ArgConsumer('a b c')
            assert.equal(result.numRemaining(), 3)
        })
        it('counts each short option separately', function() {
            var result = new ArgConsumer('-xyz a')
            assert.equal(result.numRemaining(), 4)
        })
        it('works for complex line', function() {
            var result = new ArgConsumer('a c -xyz a --foo d -mn --bar-opt')
            assert.equal(result.numRemaining(), 11)
        })

    })
    describe('peek', function() {
        describe('with no arg', function() {
            it('undefined when no args', function() {
                var result = new ArgConsumer()
                assert.isUndefined(result.peek())
            })
            it('undefined when all args have been consumed', function() {
                var result = new ArgConsumer('a b c')
                assert.equal(result.peek(), 'a')
                result.next()
                assert.equal(result.peek(), 'b')
                result.next()
                assert.equal(result.peek(), 'c')
                result.next()
                assert.isUndefined(result.peek())
            })
            it('never is always the same until a new arg is consumed', function() {
                var result = new ArgConsumer('a b c')
                assert.equal(result.peek(), 'a')
                assert.equal(result.peek(), 'a')
                result.next()
                assert.equal(result.peek(), 'b')
                assert.equal(result.peek(), 'b')
                assert.equal(result.peek(), 'b')
            })
        })

        describe('with arg', function() {
            it('throws for invalid num value', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                assert.throws(function() { result.peek(-1) })
                assert.throws(function() { result.peek('banana') })
                assert.throws(function() { result.peek({}) })
            })
            it('if arg is zero, return empty array', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                var peek = result.peek(0)
                assert.isArray(peek)
                assert.equal(peek.length, 0)
            })
            it('works for simple values', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                assert.deepEqual(result.peek(1), [ '--foo' ])
            })
            it('returns empty array when no args left regardless of arg value', function() {
                var result = new ArgConsumer()
                assert.deepEqual(result.peek(5), [])
                assert.deepEqual(result.peek(3), [])
                assert.deepEqual(result.peek(100), [])
            })
            it('result is only as long as actual args left', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                var args = [ '--foo', '-x', '-y', '-z', 'a', 'b' ]
                assert.deepEqual(result.peek(6), args)
                assert.deepEqual(result.peek(10), args)
                assert.deepEqual(result.peek(100), args)
            })
        })
    })
    describe('peekLast', function() {
        describe('with no arg', function() {
            it('undefined when no args', function() {
                var result = new ArgConsumer()
                assert.isUndefined(result.peekLast())
            })
            it('undefined when all args have been consumed', function() {
                var result = new ArgConsumer('a b c')
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.isUndefined(result.peekLast())
            })
            it('never is always the same until a new arg is consumed', function() {
                var result = new ArgConsumer('a b c')
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
            })
            it('works for options', function() {
                var result = new ArgConsumer('--foo')
                assert.equal(result.peekLast(), '--foo')
            })
            it('works for options with trailing spaces', function() {
                var result = new ArgConsumer('--foo   ')
                assert.equal(result.peekLast(), '--foo')
            })
        })

        describe('with arg', function() {
            it('throws for invalid num value', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                assert.throws(function() { result.peekLast(-1) })
                assert.throws(function() { result.peekLast('banana') })
                assert.throws(function() { result.peekLast({}) })
            })
            it('if arg is zero, return empty array', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                var peek = result.peekLast(0)
                assert.isArray(peek)
                assert.equal(peek.length, 0)
            })
            it('works for simple values', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                assert.deepEqual(result.peekLast(1), [ 'b' ])
                assert.deepEqual(result.peekLast(2), [ 'a', 'b' ])
                assert.deepEqual(result.peekLast(3), [ '-z', 'a', 'b' ])
                assert.deepEqual(result.peekLast(6), [ '--foo', '-x', '-y', '-z', 'a', 'b' ])
            })
            it('returns empty array when no args left regardless of arg value', function() {
                var result = new ArgConsumer()
                assert.deepEqual(result.peekLast(5), [])
                assert.deepEqual(result.peekLast(3), [])
                assert.deepEqual(result.peekLast(100), [])
            })
            it('result is only as long as actual args left', function() {
                var result = new ArgConsumer('--foo -xyz a b')
                var args = [ '--foo', '-x', '-y', '-z', 'a', 'b' ]
                assert.deepEqual(result.peekLast(6), args, '6')
                assert.deepEqual(result.peekLast(10), args, '10')
                assert.deepEqual(result.peekLast(100), args, '100')
            })
        })

    })

    describe('next', function() {
        it('returns undefined if none left', function() {
            var result = new ArgConsumer()
            assert.isUndefined(result.next())
        })
        it('consumes an arg each time it\'s called', function() {
            var result = new ArgConsumer('a b c')
            assert.equal(result.numRemaining(), 3)
            assert.isTrue(result.hasNext())
            assert.equal(result.next(), 'a')

            assert.equal(result.numRemaining(), 2)
            assert.isTrue(result.hasNext())
            assert.equal(result.next(), 'b')

            assert.equal(result.numRemaining(), 1)
            assert.isTrue(result.hasNext())
            assert.equal(result.next(), 'c')

            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
            assert.isUndefined(result.next())
        })
        it('calling when empty doesn\'t affect other values', function() {
            var result = new ArgConsumer()
            result.next()
            result.next()
            result.next()
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
            assert.isUndefined(result.next())
        })
    })

    describe('hasNext', function() {
        it('is false when empty', function() {
            var result = new ArgConsumer()
            assert.isFalse(result.hasNext())
        })
        it('is true when not empty', function() {
            var result = new ArgConsumer('a b c')
            assert.isTrue(result.hasNext())
        })
    })

    describe('static cleanArgv', function() {
        it('works with undefined input', function() {
            var result = new ArgConsumer.cleanArgv()
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
        })
        it('works with empty string', function() {
            var result = new ArgConsumer.cleanArgv('')
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
        })
        it('works with  string', function() {
            var result = new ArgConsumer.cleanArgv('--foo -xyz a b c')
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 7)
            assert.isTrue(result.hasNext())
        })
        it('works with argv array', function() {
            var result = new ArgConsumer.cleanArgv([ '--foo', '-xyz', 'a', 'b', 'c' ])
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 7)
            assert.isTrue(result.hasNext())
        })
    })
})
