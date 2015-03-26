var assert = require('assert');
var ably = require('../ably.js');

describe('Ably', function() {
    'use strict';

    it('should have a addTest method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.addTest, 'function');
    });

    it('should have a addTests method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.addTests, 'function');
    });

    it('should have a getTests method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.getTests, 'function');
    });

    it('should have a when method', function() {
        assert.equal(typeof ably, 'object');
        assert.equal(typeof ably.when, 'function');
    });

    it('addTest() should add tests retrievable by getTests()', function() {
        var tests = [
            {name:'button-color'},
            {name:'button-text'}
            ];

        ably.addTest(tests[0]);
        ably.addTest(tests[1]);

        assert.deepEqual(ably.getTests(), tests);
    });
});
