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

    describe('.getTest(name)', function() {
        it('retrieves test named \'name\'', function() {

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

    describe('.when()', function() {

        it('subscribes to assignment in a sane manner', function(done) {

            var callbacksCalled = [],
                randomizerCalls = 0;

            var test = {
                name: 'button-color',
                randomizer: function randomizer(callback) {
                    callback('red');
                    randomizerCalls++;
                }
            };

            ably.
                when('button-color', 'green', function callback() {
                    callbacksCalled.push(1);
                })
                .when('button-color', 'red', function callback() {
                    callbacksCalled.push(2);
                })
                .when('label-text', 'red', function callback() {
                    callbacksCalled.push(3);
                })
                .when('button-color', 'red', function callback() {
                    callbacksCalled.push(4);
                })
                .when('label-text', 'green', function callback() {
                    callbacksCalled.push(5);
                })
                .addTest(test)
                .when('button-color', 'green', function callback() {
                    callbacksCalled.push(6);
                })
                .when('button-color', 'red', function callback() {
                    callbacksCalled.push(7);
                })
                .when('label-text', 'red', function callback() {
                    callbacksCalled.push(8);
                })
                .when('button-color', 'red', function callback() {
                    callbacksCalled.push(9);
                })
                .when('label-text', 'green', function callback() {
                    callbacksCalled.push(10);
                });

            setTimeout(function verify() {
                assert.deepEqual(callbacksCalled, [2, 4, 7, 9]);
                assert.equal(randomizerCalls, 1);
                done();
            }, 20);
        });
    });
});
