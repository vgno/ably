'use strict';

var assert = require('assert');
var Ably = require('../src/ably');

var ably;

assert.testsEqual = function testsEqual(actual, expected) {
    assert.equal(actual.name, expected.name);
};

assert.deepTestsEqual = function deepTestsEqual(actual, expected) {
    assert.equal(actual.length, expected.length);
    for (var i = 0; i < actual.length; i++) {
        assert.testsEqual(actual, expected);
    }
};

describe('Ably', function() {
    beforeEach(function() {
        ably = new Ably();
    });

    it('is an object', function() {
        assert.equal(typeof ably, 'object');
    });

    it('accepts namespace', function() {
        var namespace = 'just a test namespace in order to test namespaces';
        ably = new Ably(namespace);

        assert.equal(ably.namespace, namespace);
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

    it('has an on method', function() {
        assert.equal(typeof ably.on, 'function');
    });

    var tests = [
        {
            name: 'button-color',
            sampler: function() {
                return 'red';
            },
            scope: 'memory'
        },
        {
            name: 'button-text',
            sampler: function() {
                return 'buy';
            },
            scope: 'memory'
        },
        {
            name: 'button-size',
            sampler: function() {
                return 'large';
            },
            scope: 'memory'
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
                    sampler: function() {
                        samplerCalls++;
                        return ably.samplers.default(['red', 'green']);
                    },
                    scope: 'memory'
                };

            ably.addTest(test);

            assert.equal(samplerCalls, 0);
        });

        it('adds a test with the default sampler', function(done) {
            var assignment,
                test = {
                    name: 'header-color',
                    sampler: ably.samplers.default(['orange', 'yellow']),
                    scope: 'memory'
                };

            ably.addTest(test);

            ably.on('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.on('header-color', 'yellow', function() {
                assignment = 'yellow';
            });

            setTimeout(function() {
                assert.equal(assignment === 'orange' || assignment === 'yellow', true);
                done();
            }, 10);
        });

        it('adds a test with the local sampler', function(done) {
            var assignment,
                test = {
                    name: 'header-color',
                    sampler: ably.samplers.default(['orange', 'yellow']),
                    scope: 'memory'
                };

            ably.addTest(test);

            ably.on('header-color', 'orange', function() {
                assignment = 'orange';
            });

            ably.on('header-color', 'yellow', function() {
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
                sampler: function() {
                    return 'orange';
                },
                scope: 'yeahLikeThatCouldBeTheNameOfAScope'
            };

            assert.throws(function() {
                ably.addTest(test);
            });
        });

        it('accepts no scope provided', function() {
            var test = {
                name: 'header-color',
                sampler: function() {
                    return 'orange';
                }
            };

            ably.addTest(test);
        });
    });

    describe('scope', function() {
        it('is used to get and set assignment', function(done) {
            var ably1 = new Ably(),
                ably2 = new Ably(),
                realScopeStorage = {},
                makeupScopeStorage = {
                    namespaces: {
                        default: {
                            'header-color': {
                                variant: 'blue',
                                date: new Date()
                            }
                        }
                    }
                },
                sampler = function() {
                    return 'orange';
                },
                scope1 = {
                    save: function(data) {
                        makeupScopeStorage = data;
                    },
                    load: function() {
                        return makeupScopeStorage;
                    }
                },
                scope2 = {
                    save: function(data) {
                        realScopeStorage = data;
                    },
                    load: function() {
                        return realScopeStorage;
                    }
                },
                test1 = {
                    name: 'header-color',
                    sampler: sampler,
                    scope: scope1
                },
                test2 = {
                    name: 'header-color',
                    sampler: sampler,
                    scope: scope2
                },
                assignment1;

            ably1.addTest(test1);
            ably1.on('header-color', 'blue', function() {
                assignment1 = 'blue';
            });

            ably2.addTest(test2);
            ably2.on('header-color', 'orange', function() {
            });

            setTimeout(function() {
                assert.equal(realScopeStorage.namespaces.default['header-color'].variant, 'orange');
                assert.equal(assignment1, 'blue');
                done();
            }, 10);
        });

        // it('old, inactive entries are garbage-collected', function(done) {
        // });

        // it('entries are stored under a single key', function(done) {
        // });

        // it('it is possible to select namespace', function(done) {
        // });
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
                    sampler: function sampler() {
                        samplerCalls++;
                        return 'red';
                    },
                    scope: 'memory'
                };

            ably.addTests([test]);

            assert.equal(samplerCalls, 0);
        });
    });

    describe('the sampler', function() {
        it('gets the test object as the argument', function(done) {
            var expectedTest = {
                name: 'header-color',
                sampler: function(actualTest) {
                    assert.testsEqual(actualTest, expectedTest);
                    done();
                    return 'orange';
                },
                scope: 'memory'
            };

            ably.addTest(expectedTest);

            ably.on('header-color', 'orange', function() {
            });
        });

        it('can be used for multiple tests', function(done) {
            var correctAssignments = 0,
                sampler = function(test) {
                    if (test.name === 'header-color') {
                        return 'orange';
                    }
                    if (test.name === 'button-text') {
                        return 'buy';
                    }
                },
                multipleTests = [
                    {
                        name: 'header-color',
                        sampler: sampler,
                        scope: 'memory'
                    },
                    {
                        name: 'button-text',
                        sampler: sampler,
                        scope: 'memory'
                    }
                ];

            ably.addTests(multipleTests);

            ably.on('header-color', 'orange', function() {
                correctAssignments++;
            });

            ably.on('button-text', 'buy', function() {
                correctAssignments++;
            });

            setTimeout(function() {
                assert.equal(correctAssignments, 2);
                done();
            }, 10);
        });

        it('has uniform distribution', function(done) {
            var distributions = {
                    orange: 0,
                    yellow: 0
                },
                test = {
                    name: 'header-color',
                    sampler: ably.samplers.default({orange: 10, yellow: 90}),
                    scope: 'memory'
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
                ably.on('header-color' + i, 'orange', markOrange);
                ably.on('header-color' + i, 'yellow', markYellow);
            }

            setTimeout(function() {
                assert.equal(distributions.orange >= 80, true);
                assert.equal(distributions.orange <= 120, true);
                assert.equal(distributions.yellow >= 880, true);
                assert.equal(distributions.yellow <= 920, true);
                done();
            }, 100);
        });
    });

    describe('.on()', function() {
        var callbacksCalled,
            samplerCalls,
            test = {
                name: 'button-color',
                sampler: function sampler() {
                    samplerCalls++;
                    return 'red';
                },
                scope: 'memory'
            };

        beforeEach(function() {
            callbacksCalled = [];
            samplerCalls = 0;
        });

        it('passes test into callback', function(done) {
            ably
                .addTest(test)
                .on('button-color', 'red', function callback(passedTest) {
                    assert.testsEqual(passedTest, test);
                    done();
                });
        });

        it('can subscribe before adding test', function(done) {
            ably
                .on('button-color', 'green', function callback() {
                    callbacksCalled.push(1);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(2);
                })
                .on('label-text', 'red', function callback() {
                    callbacksCalled.push(3);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(4);
                })
                .on('label-text', 'green', function callback() {
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
                .on('button-color', 'green', function callback() {
                    callbacksCalled.push(6);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(7);
                })
                .on('label-text', 'red', function callback() {
                    callbacksCalled.push(8);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(9);
                })
                .on('label-text', 'green', function callback() {
                    callbacksCalled.push(10);
                });

            setTimeout(function() {
                ably
                    .on('button-color', 'green', function callback() {
                        callbacksCalled.push(11);
                    })
                    .on('button-color', 'red', function callback() {
                        callbacksCalled.push(12);
                    })
                    .on('label-text', 'red', function callback() {
                        callbacksCalled.push(13);
                    })
                    .on('button-color', 'red', function callback() {
                        callbacksCalled.push(14);
                    })
                    .on('label-text', 'green', function callback() {
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
                .on('button-color', 'green', function callback() {
                    callbacksCalled.push(1);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(2);
                })
                .on('label-text', 'red', function callback() {
                    callbacksCalled.push(3);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(4);
                })
                .on('label-text', 'green', function callback() {
                    callbacksCalled.push(5);
                })
                .addTest(test)
                .on('button-color', 'green', function callback() {
                    callbacksCalled.push(6);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(7);
                })
                .on('label-text', 'red', function callback() {
                    callbacksCalled.push(8);
                })
                .on('button-color', 'red', function callback() {
                    callbacksCalled.push(9);
                })
                .on('label-text', 'green', function callback() {
                    callbacksCalled.push(10);
                });

            setTimeout(function() {
                ably
                    .on('button-color', 'green', function callback() {
                        callbacksCalled.push(11);
                    })
                    .on('button-color', 'red', function callback() {
                        callbacksCalled.push(12);
                    })
                    .on('label-text', 'red', function callback() {
                        callbacksCalled.push(13);
                    })
                    .on('button-color', 'red', function callback() {
                        callbacksCalled.push(14);
                    })
                    .on('label-text', 'green', function callback() {
                        callbacksCalled.push(15);
                    });
            }, 10);

            setTimeout(function verify() {
                assert.deepEqual(callbacksCalled, [2, 4, 7, 9, 12, 14]);
                assert.equal(samplerCalls, 1);
                done();
            }, 15);
        });

        it('can subscribe to all variants', function(done) {
            ably
                .addTest(test)
                .on('button-color', function callback(passedTest) {
                    assert.testsEqual(passedTest, test);
                    done();
                });
        });

        // if the subscriber is not defined or null or not a function
        // cannot add test twice
    });

    describe('.purgeOldExpositions()', function() {
        it('purges only old expositions', function() {
            var today = new Date(),
                yesterday = (function(d) {
                    d.setDate(d.getDate() - 1); return d;
                }(new Date(today.valueOf()))),
                dayBeforeYesterday = (function(d) {
                    d.setDate(d.getDate() - 1); return d;
                }(new Date(yesterday.valueOf()))),
                scopeStorage = {
                    namespaces: {
                        default: {
                            test1: {
                                variant: 'blue',
                                date: dayBeforeYesterday
                            },
                            test2: {
                                variant: 'green',
                                date: today
                            }
                        }
                    }
                };

            ably.scopes.memory.save(scopeStorage);

            ably.addTest({
                name: 'test1',
                sampler: function() {
                    return 'blue';
                },
                scope: 'memory'
            });

            ably.addTest({
                name: 'test2',
                sampler: function() {
                    return 'green';
                },
                scope: 'memory'
            });

            ably.purgeOldExpositions(yesterday);

            assert.deepEqual(ably.scopes.memory.load(), {
                namespaces: {
                    default: {
                        test2: {
                            variant: 'green',
                            date: today
                        }
                    }
                }
            });
        });
    });
});
