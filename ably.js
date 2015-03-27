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

    var Ably = function() {
        this.tests = [];
    };

    Ably.prototype.addTest = function (params) {
        this.tests.push(params);
    };

    Ably.prototype.addTests = function (newTests) {
    };

    Ably.prototype.getTests = function () {
        return this.tests;
    };

    Ably.prototype.when = function (test, variant, callback) {

    };

    return Ably;
}));
