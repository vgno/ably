var assert = require('assert');
var Ably = require('../ably.js'),
    ably;

assert.testsEqual = function deepDeepEqual(actual, expected) {
    'use strict';
    assert.equal(actual.name, expected.name);
    assert.equal(actual.variants, expected.variants);
    if (typeof expected.randomizer === 'string') {
        expected.randomizer = ably.randomizers[expected.randomizer];
    }
    assert.equal(actual.randomizer, expected.randomizer);
};

assert.deepTestsEqual = function deepDeepEqual(actual, expected) {
    'use strict';
    assert.equal(actual.length, expected.length);
    for (var i = 0; i < actual.length; i++) {
        assert.testsEqual(actual, expected);
    }
};

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

    var tests = [
        {
            name: 'button-color',
            variants: ['red', 'green'],
            randomizer: function randomizer(callback) {
                callback('red');
            },
            scope: 'object'
        },
        {
            name: 'button-text',
            variants: ['buy', 'subscribe'],
            randomizer: function randomizer(callback) {
                callback('buy');
            },
            scope: 'object'
        },
        {
            name: 'button-size',
            variants: ['large', 'small'],
            randomizer: function randomizer(callback) {
                callback('large');
            },
            scope: 'object'
        }
    ];

    describe('.getTest(name)', function() {

        it('retrieves test named \'name\'', function() {

            ably.addTest(tests[0]);
            ably.addTest(tests[1]);
            ably.addTest(tests[2]);

            assert.testsEqual(ably.getTest(tests[1].name), tests[1]);
        });

        it('throws exception if test not found', function() {

            ably.addTest(tests[0]);
            ably.addTest(tests[2]);

            assert.throws(function() {
                ably.getTest(tests[1].name);
            });
        });
    });

    describe('.addTest()', function() {
        it('adds tests', function() {

            ably.addTest(tests[0]);
            ably.addTest(tests[1]);
            ably.addTest(tests[2]);

            assert.deepTestsEqual(ably.getTests(), tests);
        });

        it('can be chained', function() {

            ably
                .addTest(tests[0])
                .addTest(tests[1])
                .addTest(tests[2]);

            assert.deepTestsEqual(ably.getTests(), tests);
        });

        it('creates a deep copy', function() {

            ably.addTest(tests[0]);

            var returnedTests = ably.getTests();

            assert.testsEqual(returnedTests[0], tests[0]);
            assert.notEqual(returnedTests[0], tests[0]);
        });

        it('does not call the randomizer if no subscribers', function() {

            var randomizerCalls = 0,
                test = {
                    name: 'button-color',
                    variants: ['red', 'green'],
                    randomizer: function randomizer() {
                        randomizerCalls++;
                    },
                    scope: 'object'
                };

            ably.addTest(test);

            assert.equal(randomizerCalls, 0);
        });

        it('adds a test with the default randomizer', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    randomizer: 'default',
                    scope: 'object'
                };

            ably.addTest(test);

            ably.when('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.when('header-color', 'yellow', function() {
                assignment = 'yellow';
            });

            setTimeout(function() {
                assert.equal(assignment === 'orange' || assignment === 'yellow', true);
                done();
            }, 10);
        });

        it('adds a test with the uniform randomizer', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    randomizer: 'uniform',
                    scope: 'object'
                };

            ably.addTest(test);

            ably.when('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.when('header-color', 'yellow', function() {
                assignment = 'yellow';
            });

            setTimeout(function() {
                assert.equal(assignment === 'orange' || assignment === 'yellow', true);
                done();
            }, 10);
        });

        it('throws exception if randomizer not found', function() {

            var test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    randomizer: 'nonExistentRandomizerIJustMadeUp',
                    scope: 'object'
                };

            assert.throws(function() {
                ably.addTest(test);
            });
        });

        it('works if no randomizer provided', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    scope: 'object'
                };

            ably.addTest(test);

            ably.when('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.when('header-color', 'yellow', function() {
                assignment = 'yellow';
            });

            setTimeout(function() {
                assert.equal(assignment === 'orange' || assignment === 'yellow', true);
                done();
            }, 10);
        });
    });

    describe('.addTests()', function() {

        it('adds tests', function() {

            ably.addTests(tests);

            assert.deepTestsEqual(ably.getTests(), tests);
        });

        it('can be chained', function() {

            ably
                .addTests([tests[0], tests[1]])
                .addTests([tests[2]]);

            var returnedTests = ably.getTests();

            assert.testsEqual(returnedTests[0], tests[0]);
        });

        it('creates deep copies', function() {

            ably.addTests(tests);

            var returnedTests = ably.getTests();

            assert.deepTestsEqual(returnedTests, tests);
            assert.notDeepEqual(returnedTests, tests);
        });

        it('does not call the randomizer if no subscribers', function() {

            var randomizerCalls = 0,
                test = {
                    name: 'button-color',
                    variants: ['red', 'green'],
                    randomizer: function randomizer() {
                        randomizerCalls++;
                    },
                    scope: 'object'
                };

            ably.addTests([test]);

            assert.equal(randomizerCalls, 0);
        });
    });

    describe('the randomizer', function() {
        it('gets the test object as the second argument', function(done) {
            var assignment,
                expectedTest = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    randomizer: function(callback, actualTest) {
                        assert.testsEqual(actualTest, expectedTest);
                        done();
                    },
                    scope: 'object'
                };

            ably.addTest(expectedTest);

            ably.when('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.when('header-color', 'yellow', function() {
                assignment = 'yellow';
            });
        });

        it('can be used for multiple tests', function(done) {

            var correctAssignments = 0,
                randomizer = function(callback, test) {
                        if (test.name === 'header-color') {
                            callback('orange');
                        }
                        if (test.name === 'button-text') {
                            callback('buy');
                        }
                    },
                    tests = [
                    {
                        name: 'header-color',
                        variants: ['orange', 'yellow'],
                        randomizer: randomizer,
                        scope: 'object'
                    },
                    {
                        name: 'button-text',
                        variants: ['buy', 'subscribe'],
                        randomizer: randomizer,
                        scope: 'object'
                    }
                    ];

            ably.addTests(tests);

            ably.when('header-color', 'orange', function() {
                correctAssignments++;
            });

            ably.when('button-text', 'buy', function() {
                correctAssignments++;
            });

            setTimeout(function() {
                assert.equal(correctAssignments, 2);
                done();
            }, 10);
        });
    });

    describe('.when()', function() {

        var callbacksCalled,
            randomizerCalls,
            test = {
                name: 'button-color',
                variants: ['red', 'green'],
                randomizer: function randomizer(callback) {
                    setTimeout(function () {
                        callback('red');
                    }, 5);
                    randomizerCalls++;
                },
                scope: 'object'
            };

        beforeEach(function() {
            callbacksCalled = [];
            randomizerCalls = 0;
        });

        it('can subscribe before adding test', function(done) {
            ably
                .when('button-color', 'green', function callback() {
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
                .addTest(test);

            setTimeout(function verify() {
                assert.deepEqual(callbacksCalled, [2, 4]);
                assert.equal(randomizerCalls, 1);
                done();
            }, 10);
        });

        it('can subscribe after adding test', function(done) {
            ably
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

            setTimeout(function() {
                ably
                    .when('button-color', 'green', function callback() {
                        callbacksCalled.push(11);
                    })
                    .when('button-color', 'red', function callback() {
                        callbacksCalled.push(12);
                    })
                    .when('label-text', 'red', function callback() {
                        callbacksCalled.push(13);
                    })
                    .when('button-color', 'red', function callback() {
                        callbacksCalled.push(14);
                    })
                    .when('label-text', 'green', function callback() {
                        callbacksCalled.push(15);
                    });
            }, 10);

            setTimeout(function verify() {
                assert.deepEqual(callbacksCalled, [7, 9, 12, 14]);
                assert.equal(randomizerCalls, 1);
                done();
            }, 15);
        });

        it('can subscribe both before and after adding test', function(done) {

            ably
                .when('button-color', 'green', function callback() {
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

            setTimeout(function() {
                ably
                    .when('button-color', 'green', function callback() {
                        callbacksCalled.push(11);
                    })
                    .when('button-color', 'red', function callback() {
                        callbacksCalled.push(12);
                    })
                    .when('label-text', 'red', function callback() {
                        callbacksCalled.push(13);
                    })
                    .when('button-color', 'red', function callback() {
                        callbacksCalled.push(14);
                    })
                    .when('label-text', 'green', function callback() {
                        callbacksCalled.push(15);
                    });
            }, 10);

            setTimeout(function verify() {
                assert.deepEqual(callbacksCalled, [2, 4, 7, 9, 12, 14]);
                assert.equal(randomizerCalls, 1);
                done();
            }, 15);
        });

        // if the subscriber is not defined or null or not a function
        // cannot add test twice
    });
});
