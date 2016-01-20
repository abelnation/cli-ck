require('babel-polyfill')
const assert = require('chai').assert

const ArgConsumer = require('../../arg-consumer')

describe('ArgConsumer', () => {
    describe('constructor', () => {
        it('throws if invalid short option chars passed in', () => {
            assert.throws(() => {
                new ArgConsumer('-a=hello')
            })
            assert.throws(() => {
                new ArgConsumer('-ab3')
            })
            assert.throws(() => {
                new ArgConsumer('-@sdf')
            })
        })
    })
    describe('numRemaining', () => {
        it('defaults to zero', () => {
            const result = new ArgConsumer()
            assert.equal(result.numRemaining(), 0)
        })
        it('works for simple args', () => {
            const result = new ArgConsumer('a b c')
            assert.equal(result.numRemaining(), 3)
        })
        it('counts each short option separately', () => {
            const result = new ArgConsumer('-xyz a')
            assert.equal(result.numRemaining(), 4)
        })
        it('works for complex line', () => {
            const result = new ArgConsumer('a c -xyz a --foo d -mn --bar-opt')
            assert.equal(result.numRemaining(), 11)
        })

    })
    describe('peek', () => {
        describe('with no arg', () => {
            it('undefined when no args', () => {
                const result = new ArgConsumer()
                assert.isUndefined(result.peek())
            })
            it('undefined when all args have been consumed', () => {
                const result = new ArgConsumer('a b c')
                assert.equal(result.peek(), 'a')
                result.next()
                assert.equal(result.peek(), 'b')
                result.next()
                assert.equal(result.peek(), 'c')
                result.next()
                assert.isUndefined(result.peek())
            })
            it('never is always the same until a new arg is consumed', () => {
                const result = new ArgConsumer('a b c')
                assert.equal(result.peek(), 'a')
                assert.equal(result.peek(), 'a')
                result.next()
                assert.equal(result.peek(), 'b')
                assert.equal(result.peek(), 'b')
                assert.equal(result.peek(), 'b')
            })
        })

        describe('with arg', () => {
            it('throws for invalid num value', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                assert.throws(() => { result.peek(-1) })
                assert.throws(() => { result.peek('banana') })
                assert.throws(() => { result.peek({}) })
            })
            it('if arg is zero, return empty array', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                const peek = result.peek(0)
                assert.isArray(peek)
                assert.equal(peek.length, 0)
            })
            it('works for simple values', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                assert.deepEqual(result.peek(1), [ '--foo' ])
            })
            it('returns empty array when no args left regardless of arg value', () => {
                const result = new ArgConsumer()
                assert.deepEqual(result.peek(5), [])
                assert.deepEqual(result.peek(3), [])
                assert.deepEqual(result.peek(100), [])
            })
            it('result is only as long as actual args left', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                const args = [ '--foo', '-x', '-y', '-z', 'a', 'b' ]
                assert.deepEqual(result.peek(6), args)
                assert.deepEqual(result.peek(10), args)
                assert.deepEqual(result.peek(100), args)
            })
        })
    })
    describe('peekLast', () => {
        describe('with no arg', () => {
            it('undefined when no args', () => {
                const result = new ArgConsumer()
                assert.isUndefined(result.peekLast())
            })
            it('undefined when all args have been consumed', () => {
                const result = new ArgConsumer('a b c')
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.isUndefined(result.peekLast())
            })
            it('never is always the same until a new arg is consumed', () => {
                const result = new ArgConsumer('a b c')
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
                result.next()
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
                assert.equal(result.peekLast(), 'c')
            })
            it('works for options', () => {
                const result = new ArgConsumer('--foo')
                assert.equal(result.peekLast(), '--foo')
            })
            it('works for options with trailing spaces', () => {
                const result = new ArgConsumer('--foo   ')
                assert.equal(result.peekLast(), '--foo')
            })
        })

        describe('with arg', () => {
            it('throws for invalid num value', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                assert.throws(() => { result.peekLast(-1) })
                assert.throws(() => { result.peekLast('banana') })
                assert.throws(() => { result.peekLast({}) })
            })
            it('if arg is zero, return empty array', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                const peek = result.peekLast(0)
                assert.isArray(peek)
                assert.equal(peek.length, 0)
            })
            it('works for simple values', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                assert.deepEqual(result.peekLast(1), [ 'b' ])
                assert.deepEqual(result.peekLast(2), [ 'a', 'b' ])
                assert.deepEqual(result.peekLast(3), [ '-z', 'a', 'b' ])
                assert.deepEqual(result.peekLast(6), [ '--foo', '-x', '-y', '-z', 'a', 'b' ])
            })
            it('returns empty array when no args left regardless of arg value', () => {
                const result = new ArgConsumer()
                assert.deepEqual(result.peekLast(5), [])
                assert.deepEqual(result.peekLast(3), [])
                assert.deepEqual(result.peekLast(100), [])
            })
            it('result is only as long as actual args left', () => {
                const result = new ArgConsumer('--foo -xyz a b')
                const args = [ '--foo', '-x', '-y', '-z', 'a', 'b' ]
                assert.deepEqual(result.peekLast(6), args, '6')
                assert.deepEqual(result.peekLast(10), args, '10')
                assert.deepEqual(result.peekLast(100), args, '100')
            })
        })

    })

    describe('next', () => {
        it('returns undefined if none left', () => {
            const result = new ArgConsumer()
            assert.isUndefined(result.next())
        })
        it('consumes an arg each time it\'s called', () => {
            const result = new ArgConsumer('a b c')
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
        it('calling when empty doesn\'t affect other values', () => {
            const result = new ArgConsumer()
            result.next()
            result.next()
            result.next()
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
            assert.isUndefined(result.next())
        })
    })

    describe('hasNext', () => {
        it('is false when empty', () => {
            const result = new ArgConsumer()
            assert.isFalse(result.hasNext())
        })
        it('is true when not empty', () => {
            const result = new ArgConsumer('a b c')
            assert.isTrue(result.hasNext())
        })
    })

    describe('static cleanArgv', () => {
        it('works with undefined input', () => {
            const result = new ArgConsumer.cleanArgv()
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
        })
        it('works with empty string', () => {
            const result = new ArgConsumer.cleanArgv('')
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 0)
            assert.isFalse(result.hasNext())
        })
        it('works with  string', () => {
            const result = new ArgConsumer.cleanArgv('--foo -xyz a b c')
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 7)
            assert.isTrue(result.hasNext())
        })
        it('works with argv array', () => {
            const result = new ArgConsumer.cleanArgv([ '--foo', '-xyz', 'a', 'b', 'c' ])
            assert.instanceOf(result, ArgConsumer)
            assert.equal(result.numRemaining(), 7)
            assert.isTrue(result.hasNext())
        })
    })
})
