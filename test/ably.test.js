var assert = require('assert');
var Ably = require('../ably.js'),
    ably;

describe('Ably', function() {
    'use strict';

    beforeEach(function() {
        ably = new Ably();
    });

    it('is an object', function() {
        assert.equal(typeof ably, 'object');
    });

    it('has an addTest method', function() {
        assert.equal(typeof ably.addTest, 'function');
    });

    it('has an addTests method', function() {
        assert.equal(typeof ably.addTests, 'function');
    });

    it('has a getTest method', function() {
        assert.equal(typeof ably.getTest, 'function');
    });

    it('has a getTests method', function() {
        assert.equal(typeof ably.getTests, 'function');
    });

    it('has a when method', function() {
        assert.equal(typeof ably.when, 'function');
    });

    it('has a getAllSubscribers method', function() {
        assert.equal(typeof ably.getAllSubscribers, 'function');
    });

    it('has a getSubscribers method', function() {
        assert.equal(typeof ably.getSubscribers, 'function');
    });

    describe('.getTest(name)', function() {
        it('gets test named \'name\'', function() {

            var test = {name:'button-text'};

            ably.addTest({name:'button-color'});
            ably.addTest(test);
            ably.addTest({name:'button-size'});

            assert.equal(ably.getTest(test.name), test);
        });

        it('throws exception if test not found', function() {

            var test = {name:'button-text'};

            ably.addTest({name:'button-color'});
            ably.addTest({name:'button-size'});

            assert.throws(function() {
                ably.getTest(test.name);
            });
        });
    });

    describe('.addTest()', function() {
        it('adds tests', function() {
            var tests = [
                {name:'button-color'},
                {name:'button-text'}
                ];

            ably.addTest(tests[0]);
            ably.addTest(tests[1]);

            assert.deepEqual(ably.getTests(), tests);
        });

        it('can be chained', function() {
            var tests = [
                {name:'button-color'},
                {name:'button-text'}
                ];

            ably
                .addTest(tests[0])
                .addTest(tests[1]);

            assert.deepEqual(ably.getTests(), tests);
        });
    });

    describe('.addTests()', function() {

        it('adds tests', function() {

            var tests = [
                {name:'button-border'},
                {name:'button-shadow'}
                ];

            ably.addTests(tests);

            assert.deepEqual(ably.getTests(), tests);
        });

        it('can be chained', function() {

            var tests1 = [
                {name:'button-border'},
                {name:'button-shadow'}
                ],
                tests2 = [
                {name:'button-border'},
                {name:'button-shadow'}
                ];

            ably
                .addTests(tests1)
                .addTests(tests2);

            assert.deepEqual(ably.getTests(), tests1.concat(tests2));
        });
    });

    describe('.getSubscribers(test, variant)', function() {

        it('returns all subscribers for test and variant and nothing else', function() {

            var test = 'button-color',
                variant = 'red';

            var subscribers = [
                {
                    test: test,
                    variant: variant,
                    callback: function dummyCallback1() {}
                },
                {
                    test: test,
                    variant: 'green',
                    callback: function dummyCallback2() {}
                },
                {
                    test: 'button-text',
                    variant: 'buy',
                    callback: function dummyCallback3() {}
                },
                {
                    test: 'button-background-color',
                    variant: variant,
                    callback: function dummyCallback4() {}
                }
                ];

            ably.when(subscribers[0].test, subscribers[0].variant, subscribers[0].callback);
            ably.when(subscribers[1].test, subscribers[1].variant, subscribers[1].callback);
            ably.when(subscribers[2].test, subscribers[2].variant, subscribers[2].callback);
            ably.when(subscribers[3].test, subscribers[3].variant, subscribers[3].callback);

            assert.deepEqual(ably.getSubscribers(test, variant), [subscribers[0]]);
        });
    });

    describe('.when()', function() {

        it('adds subscribers', function() {

            var subscribers = [
                {
                    test: 'button-color',
                    variant: 'red',
                    callback: function dummyCallback() {}
                },
                {
                    test: 'button-color',
                    variant: 'green',
                    callback: function dummyCallback() {}
                }
                ];

            ably.when(subscribers[0].test, subscribers[0].variant, subscribers[0].callback);
            ably.when(subscribers[1].test, subscribers[1].variant, subscribers[1].callback);

            assert.deepEqual(ably.getAllSubscribers(), subscribers);
        });

        it('can be chained', function() {

            var subscribers = [
                {
                    test: 'button-color',
                    variant: 'red',
                    callback: function dummyCallback() {}
                },
                {
                    test: 'button-color',
                    variant: 'green',
                    callback: function dummyCallback() {}
                }
                ];

            ably
                .when(subscribers[0].test, subscribers[0].variant, subscribers[0].callback)
                .when(subscribers[1].test, subscribers[1].variant, subscribers[1].callback);

            assert.deepEqual(ably.getAllSubscribers(), subscribers);
        });
    });
});
