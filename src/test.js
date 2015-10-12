'use strict';

var Test = function Test(options) {
    var self = this;

    function notifySubscribers() {
        var subscriber;

        for (var i = 0; i < self.subscribers.length; i++) {
            subscriber = self.subscribers[i];
            if (subscriber.matchesTestAndVariant(self.name, self.getAssignment())) {
                subscriber.notify(self);
            }
        }

        self.subscribers = [];
    }

    function requestAssignment() {
        if (!isPendingAssignment()) {
            markPendingAssignment();
            self.sampler(function(assignment) {
                clearPendingAssignment();
                setAssignment(assignment);
                notifySubscribers();
            }, self);
        }
    }

    function setAssignment(assignment) {
        self.scope.setItem(self.name, assignment);
    }

    function isPendingAssignment() {
        return self.hasOwnProperty('pendingAssignment');
    }

    function markPendingAssignment() {
        self.pendingAssignment = true;
    }

    function clearPendingAssignment() {
        delete self.pendingAssignment;
    }

    this.name = options.name;
    this.sampler = options.sampler;
    this.scope = options.scope;
    this.variants = options.variants;
    this.weights = options.weights;
    this.subscribers = [];

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
    return this.scope.hasItem(this.name);
};

Test.prototype.getAssignment = function() {
    return this.scope.getItem(this.name);
};

module.exports = Test;
