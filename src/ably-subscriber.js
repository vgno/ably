'use strict';

var AblySubscriber = function AblySubscriber(options) {
    this.test = options.test;
    if (options.hasOwnProperty('variant')) {
        this.variant = options.variant;
    }
    this.callback = options.callback;
};

AblySubscriber.prototype.notify = function(test) {
    var self = this;
    setTimeout(function notifySubscriberNow() {
        self.callback(test);
    }, 1);
};

AblySubscriber.prototype.matchesTest = function(test) {
    return this.test === test.name;
};

AblySubscriber.prototype.matchesTestAndVariant = function(test, variant) {
    if (this.hasOwnProperty('variant')) {
        return this.test === test && this.variant === variant;
    }

    return this.test === test;
};

module.exports = AblySubscriber;
