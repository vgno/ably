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

    it('has a getTests method', function() {
        assert.equal(typeof ably.getTests, 'function');
    });

    it('has a when method', function() {
        assert.equal(typeof ably.when, 'function');
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
});
