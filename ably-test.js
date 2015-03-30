(function (root, factory) {
    'use strict';

    /* istanbul ignore next: untestable with Node-style definition */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            return factory();
        });
    } else {
        /* istanbul ignore else: untestable with Node-style definition */
        if (typeof exports === 'object') {
            // Node-style
            module.exports = factory();
        } else {
            // Browser globals (root is window)
            root.ablyTest = factory();
        }
    }
}(this, function () {
    'use strict';

    var AblyTest = function AblyTest(options) {

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
                    setAssignment(assignment);
                    notifySubscribers();
                });
            }
        }

        function setAssignment(assignment) {
            self.assignment = assignment;
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

    AblyTest.prototype.hasAssignment = function() {
        return this.hasOwnProperty('assignment');
    };

    AblyTest.prototype.getAssignment = function() {
        return this.assignment;
    };

    AblyTest.prototype.isPendingAssignment = function() {
        return this.hasOwnProperty('pendingAssignment');
    };

    AblyTest.prototype.markPendingAssignment = function() {
        this.pendingAssignment = true;
    };

    AblyTest.prototype.clearPendingAssignment = function() {
        delete(this.pendingAssignment);
    };

    return AblyTest;
}));
