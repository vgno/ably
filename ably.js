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

    var Ably = function Ably() {

        // Private methods
        function notifySubscriber(subscriber) {
            setTimeout(function notifySubscriberNow() {
                subscriber.callback();
            }, 1);
        }

        function notifyMatchingSubscribers(test, assignment) {
            for (var i = 0; i < self.subscribers.length; i++) {
                var s = self.subscribers[i];
                if (s.test === test && s.variant === assignment) {
                    notifySubscriber(self.subscribers[i]);
                }
            }
        }

        function hasAssignment(test) {
            return test.hasOwnProperty('assignment');
        }

        function setAssignment(test, assignment) {
            test.assignment = assignment;
        }

        function getAssignment(test) {
            return test.assignment;
        }

        function isPendingAssignment(test) {
            return test.hasOwnProperty('pendingAssignment');
        }

        function markPendingAssignment(test) {
            test.pendingAssignment = true;
        }

        function clearPendingAssignment(test) {
            delete(test.pendingAssignment);
        }

        function requestAssignment(t, callback) {
            if (!isPendingAssignment(t)) {
                markPendingAssignment(t);
                t.randomizer(function(assignment) {
                    clearPendingAssignment(t);
                    callback(assignment);
                });
            }
        }

        function notifySubscriberOnAssignment(test, subscriber) {

            self.subscribers.push(subscriber);

            // Make sure to notify the subscriber now or in the future
            if (hasAssignment(test)) {
                if (subscriber.variant === getAssignment(test)) {
                    notifySubscriber(subscriber);
                }
            } else {
                // Trigger request for assignment
                triggerRequestForAssignment(test);
            }
        }

        function triggerRequestForAssignment(test) {
            requestAssignment(test, function(assignment) {
                setAssignment(test, assignment);
                notifyMatchingSubscribers(test.name, assignment);
            });
        }

        this.tests = [];
        this.subscribers = [];

        var self = this;

        // Privileged methods
        this.when = function (testName, variant, callback) {

            var subscriber = {
                test: testName,
                variant: variant,
                callback: callback
            };
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

            var test = {
                name: options.name,
                randomizer: options.randomizer,
                scope: options.scope
            };

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
