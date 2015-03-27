(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            var Ably = factory();
            return new Ably();
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        var Ably = factory();
        root.ably = new Ably();
  }
}(this, function () {
    'use strict';

    function Exception(message) {
       this.message = message;
    }

    var Ably = function Ably() {
        this.tests = [];
        this.subscribers = [];
    };

    Ably.prototype.addTest = function (params) {
        this.tests.push(params);
        return this;
    };

    Ably.prototype.addTests = function (tests) {
        this.tests = this.tests.concat(tests);
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

    Ably.prototype.when = function (test, variant, callback) {
        this.subscribers.push({
            test: test,
            variant: variant,
            callback: callback
        });
        return this;
    };

    Ably.prototype.getSubscribers = function (test, variant) {
        var subscribers = [];
        for (var i = 0; i < this.subscribers.length; i++) {
            var s = this.subscribers[i];
            if (s.test === test && s.variant === variant) {
                subscribers.push(s);
            }
        }
        return subscribers;
    };

    Ably.prototype.getAllSubscribers = function () {
        return this.subscribers;
    };

    return Ably;
}));
