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
            root.AblyTest = factory();
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
            if (!isPendingAssignment()) {
                markPendingAssignment();
                self.randomizer(function(assignment) {
                    clearPendingAssignment();
                    setAssignment(assignment);
                    notifySubscribers();
                }, self);
            }
        }

        function setAssignment(assignment) {
            self.scope.set(self.name, assignment);
        }

        function isPendingAssignment() {
            return self.hasOwnProperty('pendingAssignment');
        }

        function markPendingAssignment() {
            self.pendingAssignment = true;
        }

        function clearPendingAssignment() {
            delete(self.pendingAssignment);
        }

        this.name = options.name;
        this.randomizer = options.randomizer;
        this.scope = options.scope;
        this.variants = options.variants;
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
        return this.scope.has(this.name);
    };

    AblyTest.prototype.getAssignment = function() {
        return this.scope.get(this.name);
    };

    return AblyTest;
}));
