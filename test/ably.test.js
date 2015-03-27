var assert = require('assert');
var Ably = require('../ably.js'),
    ably;

describe('Ably', function() {
    'use strict';

    beforeEach(function() {
        ably = new Ably();
    });

    it('has an addTest method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.addTest, 'function');
    });

    it('has an addTests method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.addTests, 'function');
    });

    it('has a getTests method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.getTests, 'function');
    });

    it('has a when method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.when, 'function');
    });

    describe('.addTest()', function() {
        it('adds tests retrievable by getTests()', function() {
            var tests = [
                {name:'button-color'},
                {name:'button-text'}
                ];

            ably.addTest(tests[0]);
            ably.addTest(tests[1]);

            assert.deepEqual(ably.getTests(), tests);
        });
    });

    describe('.addTests()', function() {

        it('adds tests retrievable by getTests()', function() {

            var tests = [
                {name:'button-border'},
                {name:'button-shadow'}
                ];

            ably.addTests(tests);

            assert.deepEqual(ably.getTests(), tests);
        });
    });
});
