var assert = require('assert');
var Ably = require('../ably.js'),
    ably;

assert.testsEqual = function deepDeepEqual(actual, expected) {
    'use strict';
    assert.equal(actual.name, expected.name);
    assert.equal(actual.variants, expected.variants);
    if (typeof expected.sampler === 'string') {
        expected.sampler = ably.samplers[expected.sampler];
    }
    assert.equal(actual.sampler, expected.sampler);
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
            sampler: function sampler(callback) {
                callback('red');
            },
            scope: 'pageview'
        },
        {
            name: 'button-text',
            variants: ['buy', 'subscribe'],
            sampler: function sampler(callback) {
                callback('buy');
            },
            scope: 'pageview'
        },
        {
            name: 'button-size',
            variants: ['large', 'small'],
            sampler: function sampler(callback) {
                callback('large');
            },
            scope: 'pageview'
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

        it('does not call the sampler if no subscribers', function() {

            var samplerCalls = 0,
                test = {
                    name: 'button-color',
                    variants: ['red', 'green'],
                    sampler: function sampler() {
                        samplerCalls++;
                    },
                    scope: 'pageview'
                };

            ably.addTest(test);

            assert.equal(samplerCalls, 0);
        });

        it('adds a test with the default sampler', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: 'default',
                    scope: 'pageview'
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

        it('adds a test with the uniform sampler', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: 'uniform',
                    scope: 'pageview'
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

        it('adds a test with the weighted sampler', function(done) {

            var distributions = {
                    orange: 0,
                    yellow: 0
                },
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: 'weighted',
                    scope: 'pageview',
                    weights: {orange: 10, yellow: 90}
                },
                markOrange = function() {
                    distributions.orange++;
                },
                markYellow = function() {
                    distributions.yellow++;
                };

            for (var i = 0; i < 1000; i++) {
                test.name = 'header-color' + i;
                ably.addTest(test);
                ably.when('header-color' + i, 'orange', markOrange);
                ably.when('header-color' + i, 'yellow', markYellow);
            }

            setTimeout(function() {
                assert.equal(distributions.orange >= 80, true);
                assert.equal(distributions.orange <= 120, true);
                assert.equal(distributions.yellow >= 880, true);
                assert.equal(distributions.yellow <= 920, true);
                done();
            }, 100);
        });

        it('throws exception if sampler not found', function() {

            var test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: 'nonExistentSamplerIJustMadeUp',
                    scope: 'pageview'
                };

            assert.throws(function() {
                ably.addTest(test);
            });
        });

        it('works if no sampler provided', function(done) {

            var assignment,
                test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    scope: 'pageview'
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

        it('throws exception if scope not found', function() {

            var test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    scope: 'yeahLikeThatCouldBeTheNameOfAScope'
                };

            assert.throws(function() {
                ably.addTest(test);
            });
        });

        it('uses scope to get and set assignment', function(done) {

            var ably1 = new Ably(),
                ably2 = new Ably(),
                realScopeStorage = {},
                makeupScopeStorage = {
                    'header-color': 'blue'
                },
                sampler = function (callback) {
                    callback('orange');
                },
                scope = {
                    hasItem: function(key) {
                        return realScopeStorage.hasOwnProperty(key);
                    },
                    getItem: function(key) {
                        return makeupScopeStorage[key];
                    },
                    setItem: function(key, value) {
                        realScopeStorage[key] = value;
                    }
                },
                test1 = {
                    name: 'header-color',
                    variants: ['orange', 'blue'],
                    sampler: sampler,
                    scope: scope
                },
                test2 = {
                    name: 'header-color',
                    variants: ['orange', 'blue'],
                    sampler: sampler,
                    scope: scope
                },
                assignment2;

            ably1.addTest(test1);
            ably1.when('header-color', 'orange', function() {
            });

            ably2.addTest(test2);
            ably2.when('header-color', 'blue', function() {
                assignment2 = 'blue';
            });

            setTimeout(function() {
                assert.equal(realScopeStorage['header-color'], 'orange');
                assert.equal(assignment2, 'blue');
                done();
            }, 10);
        });

        it('accepts no scope provided', function() {

            var test = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: 'uniform'
                };

            ably.addTest(test);
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

        it('does not call the sampler if no subscribers', function() {

            var samplerCalls = 0,
                test = {
                    name: 'button-color',
                    variants: ['red', 'green'],
                    sampler: function sampler() {
                        samplerCalls++;
                    },
                    scope: 'pageview'
                };

            ably.addTests([test]);

            assert.equal(samplerCalls, 0);
        });
    });

    describe('the sampler', function() {
        it('gets the test object as the second argument', function(done) {
            var assignment,
                expectedTest = {
                    name: 'header-color',
                    variants: ['orange', 'yellow'],
                    sampler: function(callback, actualTest) {
                        assert.testsEqual(actualTest, expectedTest);
                        done();
                    },
                    scope: 'pageview'
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
                sampler = function(callback, test) {
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
                        sampler: sampler,
                        scope: 'pageview'
                    },
                    {
                        name: 'button-text',
                        variants: ['buy', 'subscribe'],
                        sampler: sampler,
                        scope: 'pageview'
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
            samplerCalls,
            test = {
                name: 'button-color',
                variants: ['red', 'green'],
                sampler: function sampler(callback) {
                    setTimeout(function () {
                        callback('red');
                    }, 5);
                    samplerCalls++;
                },
                scope: 'pageview'
            };

        beforeEach(function() {
            callbacksCalled = [];
            samplerCalls = 0;
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
                assert.equal(samplerCalls, 1);
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
                assert.equal(samplerCalls, 1);
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
                assert.equal(samplerCalls, 1);
                done();
            }, 15);
        });

        // if the subscriber is not defined or null or not a function
        // cannot add test twice
    });
});
