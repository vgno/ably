(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.ably = factory();
  }
}(this, function () {
    'use strict';

    var Ably = {},
    tests = [],

    addTest = function (params) {
        tests.push(params);
    },

    getTests = function () {
        return tests;
    },

    when = function (test, variant, callback) {

    };

    // exported functions
    Ably.addTest = addTest;
    Ably.when = when;
    Ably.getTests = getTests;

    return Ably;
}));
