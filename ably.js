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

        this.name = options.name;
        this.randomizer = options.randomizer;
        this.scope = options.scope;
    };

    Test.prototype.hasAssignment = function() {
        return this.hasOwnProperty('assignment');
    };

    Test.prototype.setAssignment = function(assignment) {
        this.assignment = assignment;
    };

    Test.prototype.getAssignment = function() {
        return this.assignment;
        // if no assignment throw error
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

    Test.prototype.requestAssignment = function(callback) {
        if (!this.isPendingAssignment()) {
            this.markPendingAssignment();
            var self = this;
            this.randomizer(function(assignment) {
                self.clearPendingAssignment();
                callback(assignment);
            });
        }
    };

    Test.prototype.triggerRequestForAssignment = function(callback) {
        var self = this;
        this.requestAssignment(function(assignment) {
            self.setAssignment(assignment);
            callback(assignment);
        });
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

    Subscriber.prototype.matches = function(test, variant) {
        return this.test === test && this.variant === variant;
    };

    var Ably = function Ably() {

        function triggerRequestForAssignment(test) {
            test.triggerRequestForAssignment(function(assignment) {
                notifyMatchingSubscribers(test.name, assignment);
            });
        }

        // Private methods
        function notifyMatchingSubscribers(test, assignment) {
            for (var i = 0; i < self.subscribers.length; i++) {
                var subscriber = self.subscribers[i];
                if (subscriber.matches(test, assignment)) {
                    subscriber.notify();
                }
            }
        }

        function notifySubscriberOnAssignment(test, subscriber) {

            self.subscribers.push(subscriber);

            // Make sure to notify the subscriber now or in the future
            if (test.hasAssignment()) {
                if (subscriber.variant === test.getAssignment()) {
                    subscriber.notify();
                }
            } else {
                // Trigger request for assignment
                triggerRequestForAssignment(test);
            }
        }

        this.tests = [];
        this.subscribers = [];

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
                // Add subscriber to notify when the test becomes available
                this.subscribers.push(subscriber);
                return this;
            }

            notifySubscriberOnAssignment(test, subscriber);

            return this;
        };

        this.addTest = function (options) {

            var test = new Test({
                name: options.name,
                randomizer: options.randomizer,
                scope: options.scope
            });

            this.tests.push(test);

            if (this.subscribers.length > 0) {

                // Trigger request for assignment
                triggerRequestForAssignment(test);
            }
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
