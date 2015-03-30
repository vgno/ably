(function (root, classFactory) {
    'use strict';

    /* istanbul ignore next: untestable with Node-style definition */
    function getInstance(AClass) {
        return new AClass();
    }

    /* istanbul ignore next: untestable with Node-style definition */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            return getInstance(classFactory());
        });
    } else {
        /* istanbul ignore else: untestable with Node-style definition */
        if (typeof exports === 'object') {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = classFactory();
        } else {
            // Browser globals (root is window)
            root.ably = getInstance(classFactory());
        }
    }
}(this, function () {
    'use strict';

    var Test = function Test(options) {

        function notifySubscribers() {

            self.subscribers.forEach(function(subscriber) {
                if (subscriber.matchesTestAndVariant(self.name, self.getAssignment())) {
                    subscriber.notify();
                }
            });

            self.subscribers = [];
        }

        function requestAssignment() {
            if (!self.isPendingAssignment()) {
                self.markPendingAssignment();
                self.randomizer(function(assignment) {
                    self.clearPendingAssignment();
                    self.setAssignment(assignment);
                    notifySubscribers();
                });
            }
        }

        this.name = options.name;
        this.randomizer = options.randomizer;
        this.scope = options.scope;
        this.subscribers = [];

        var self = this;

        this.addSubscriber = function(subscriber) {
            this.subscribers.push(subscriber);

            if (this.hasAssignment()) {
                notifySubscribers();
            } else {
                requestAssignment();
            }
        };
    };

    Test.prototype.hasAssignment = function() {
        return this.hasOwnProperty('assignment');
    };

    Test.prototype.setAssignment = function(assignment) {
        this.assignment = assignment;
    };

    Test.prototype.getAssignment = function() {
        return this.assignment;
    };

    Test.prototype.isPendingAssignment = function() {
        return this.hasOwnProperty('pendingAssignment');
    };

    Test.prototype.markPendingAssignment = function() {
        this.pendingAssignment = true;
    };

    Test.prototype.clearPendingAssignment = function() {
        delete(this.pendingAssignment);
    };

    var Subscriber = function Subscriber(options) {
        this.test = options.test;
        this.variant = options.variant;
        this.callback = options.callback;
    };

    Subscriber.prototype.notify = function() {
        var self = this;
        setTimeout(function notifySubscriberNow() {
            self.callback();
        }, 1);
    };

    Subscriber.prototype.matchesTest = function(test) {
        return this.test === test.name;
    };

    Subscriber.prototype.matchesTestAndVariant = function(test, variant) {
        return this.test === test && this.variant === variant;
    };

    var Ably = function Ably() {

        function relayPendingSubscribers(test) {

            var unmatchedSubscribers = [];

            self.pendingSubscribers.forEach(function(pendingSubscriber) {
                if (pendingSubscriber.matchesTest(test)) {
                    test.addSubscriber(pendingSubscriber);
                } else {
                    unmatchedSubscribers.push(pendingSubscriber);
                }
            });

            self.pendingSubscribers = unmatchedSubscribers;
        }

        this.tests = [];
        this.pendingSubscribers = [];

        var self = this;

        // Privileged methods
        this.when = function (testName, variant, callback) {

            var subscriber = new Subscriber({
                test: testName,
                variant: variant,
                callback: callback
            });
            var test;

            try {
                test = this.getTest(subscriber.test);
            } catch (e) {
                this.pendingSubscribers.push(subscriber);
                return this;
            }

            test.addSubscriber(subscriber);

            return this;
        };

        this.addTest = function (options) {

            var test = new Test({
                name: options.name,
                randomizer: options.randomizer,
                scope: options.scope
            });

            this.tests.push(test);

            relayPendingSubscribers(test);

            return this;
        };
    };

    Ably.prototype.addTests = function (tests) {
        for (var i = 0; i < tests.length; i++) {
            this.addTest(tests[i]);
        }
        return this;
    };

    Ably.prototype.getTest = function (name) {
        for (var i = 0; i < this.tests.length; i++) {
            if (this.tests[i].name === name) {
                return this.tests[i];
            }
        }
        throw new Error('test \'' + name + '\' not found');
    };

    Ably.prototype.getTests = function () {
        return this.tests;
    };

    return Ably;
}));
