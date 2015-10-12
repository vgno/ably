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
        self.expositionManager.registerExposition(self.scope, self.name, assignment);
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
    this.expositionManager = options.expositionManager;

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
    return this.expositionManager.getExposition(this.scope, this.name) !== null;
};

Test.prototype.getAssignment = function() {
    var exposition = this.expositionManager.getExposition(this.scope, this.name);
    return exposition.variant;
};

Test.prototype.purgeOldExpositions = function(cutoffDate) {
    this.expositionManager.purgeOldExpositions(this.scope, cutoffDate);
};

module.exports = Test;
