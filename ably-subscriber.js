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
            root.AblySubscriber = factory();
        }
    }
}(this, function () {
    'use strict';

    var AblySubscriber = function AblySubscriber(options) {
        this.test = options.test;
        this.variant = options.variant;
        this.callback = options.callback;
    };

    AblySubscriber.prototype.notify = function() {
        var self = this;
        setTimeout(function notifySubscriberNow() {
            self.callback();
        }, 1);
    };

    AblySubscriber.prototype.matchesTest = function(test) {
        return this.test === test.name;
    };

    AblySubscriber.prototype.matchesTestAndVariant = function(test, variant) {
        return this.test === test && this.variant === variant;
    };

    return AblySubscriber;
}));
