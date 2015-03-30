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

    function Exception(message) {
       this.message = message;
    }

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

        function hasAssignment(testObject) {
            return testObject.hasOwnProperty('assignment');
        }

        function setAssignment(testObject, assignment) {
            testObject.assignment = assignment;
        }

        function getAssignment(testObject) {
            return testObject.assignment;
        }

        function isPendingAssignment(testObject) {
            return testObject.hasOwnProperty('pendingAssignment');
        }

        function markPendingAssignment(testObject) {
            testObject.pendingAssignment = true;
        }

        function clearPendingAssignment(testObject) {
            delete(testObject.pendingAssignment);
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

        function notifySubscriberOnAssignment(testObject, subscriber) {

            self.subscribers.push(subscriber);

            // Make sure to notify the subscriber now or in the future
            if (hasAssignment(testObject)) {
                if (subscriber.variant === getAssignment(testObject)) {
                    notifySubscriber(subscriber);
                }
            } else {
                // Trigger request for assignment
                triggerRequestForAssignment(testObject);
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
        this.when = function (test, variant, callback) {

            var subscriber = {
                test: test,
                variant: variant,
                callback: callback
            };
            var testObject;

            try {
                testObject = this.getTest(test);
            } catch (e) {
                // Add subscriber to notify when the test becomes available
                this.subscribers.push(subscriber);
                return this;
            }

            notifySubscriberOnAssignment(testObject, subscriber);

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
        throw new Exception('test \'' + name + '\' not found');
    };

    Ably.prototype.getTests = function () {
        return this.tests;
    };

    return Ably;
}));
