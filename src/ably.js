'use strict';

var Test = require('./test');
var Subscriber = require('./subscriber');

var Ably = function Ably(namespace) {
    var self = this;

    function relayPendingSubscribers(test) {
        var unmatchedSubscribers = [],
            pendingSubscriber;

        for (var i = 0; i < self.pendingSubscribers.length; i++) {
            pendingSubscriber = self.pendingSubscribers[i];

            if (pendingSubscriber.matchesTest(test)) {
                test.addSubscriber(pendingSubscriber);
            } else {
                unmatchedSubscribers.push(pendingSubscriber);
            }
        }

        self.pendingSubscribers = unmatchedSubscribers;
    }

    function uniformSampler(callback, test) {
        callback(test.variants[Math.floor(Math.random() * test.variants.length)]);
    }

    function mathRandomSampler(callback, test) {
        var total = 0,
            current = 0,
            random,
            variant;

        if (typeof test.weights === 'undefined') {
            uniformSampler(callback, test);
            return;
        }

        for (variant in test.weights) {
            if (test.weights.hasOwnProperty(variant)) {
                total += test.weights[variant];
            }
        }

        random = Math.random() * total;

        for (variant in test.weights) {
            if (test.weights.hasOwnProperty(variant)) {
                if (random < current + test.weights[variant]) {
                    callback(variant);
                    return;
                }
                current += test.weights[variant];
            }
        }
    }

    function interpretSamplerOptions(options) {
        if (!options.hasOwnProperty('sampler')) {
            return self.samplers.default;
        }

        if (typeof options.sampler === 'function') {
            return options.sampler;
        }

        if (self.samplers.hasOwnProperty(options.sampler)) {
            return self.samplers[options.sampler];
        }

        throw new Error('sampler \'' + options.sampler + '\' not found');
    }

    function firstAvailableScope(scopes) {
        var i, scope;
        for (i = 0; i < scopes.length; i++) {
            scope = scopes[i];
            if (typeof scope.isAvailable !== 'function' || scope.isAvailable()) {
                return scope;
            }
        }
        throw new Error('no available scope provided');
    }

    function availableScope(scope) {
        return firstAvailableScope([scope, self.scopes.pageview]);
    }

    function interpretScopeOptions(options) {
        if (!options.hasOwnProperty('scope')) {
            return availableScope(self.scopes.default);
        }

        if (typeof options.scope === 'object') {
            return availableScope(options.scope);
        }

        if (self.scopes.hasOwnProperty(options.scope)) {
            return availableScope(self.scopes[options.scope]);
        }

        throw new Error('scope \'' + options.scope + '\' not found');
    }

    var pageViewScopeStorage = {},
        pageViewScope = {
            hasItem: function(key) {
                return pageViewScopeStorage.hasOwnProperty(key);
            },
            getItem: function(key) {
                return pageViewScopeStorage[key];
            },
            setItem: function(key, value) {
                pageViewScopeStorage[key] = value;
            },
            isAvailable: function() {
                return true;
            }
        },
        localStorageScope = {
            hasItem: function(key) {
                return localStorage.getItem(key) !== null;
            },
            getItem: function(key) {
                return localStorage.getItem(key);
            },
            setItem: function(key, value) {
                localStorage.setItem(key, value);
            },
            isAvailable: function() {
                var testKey = '__test_localStorage_capability_ably_18c09e96bdd2cfe6ca47f3285f1b935d';
                try {
                    var storage = window.localStorage;
                    storage.setItem(testKey, '1');
                    storage.removeItem(testKey);
                    return true;
                } catch (error) {
                    return false;
                }
            }
        };

    if (namespace === undefined) {
        namespace = 'default';
    }
    this.namespace = namespace;
    this.tests = [];
    this.pendingSubscribers = [];
    this.samplers = {
        local: mathRandomSampler,
        default: mathRandomSampler
    };
    this.scopes = {
        pageview: pageViewScope,
        device: localStorageScope,
        default: localStorageScope
    };

    // Privileged methods
    this.when = function(testName, variant, callback) {
        var subscriberOptions = {
            test: testName
        };

        // if variant is a function, it actually is callback
        if (typeof variant === 'function') {
            callback = variant;
        } else {
            subscriberOptions.variant = variant;
        }

        subscriberOptions.callback = callback;

        var subscriber = new Subscriber(subscriberOptions);
        var test;

        try {
            test = this.getTest(subscriber.test);
        } catch (e) {
            this.pendingSubscribers.push(subscriber);
            return this;
        }

        test.addSubscriber(subscriber);

        return this;
    };

    this.addTest = function(options) {
        var test = new Test({
            name: options.name,
            variants: options.variants,
            sampler: interpretSamplerOptions(options),
            scope: interpretScopeOptions(options),
            weights: options.weights
        });

        this.tests.push(test);

        relayPendingSubscribers(test);

        return this;
    };
};

Ably.prototype.addTests = function(tests) {
    for (var i = 0; i < tests.length; i++) {
        this.addTest(tests[i]);
    }
    return this;
};

Ably.prototype.getTest = function(name) {
    for (var i = 0; i < this.tests.length; i++) {
        if (this.tests[i].name === name) {
            return this.tests[i];
        }
    }
    throw new Error('test \'' + name + '\' not found');
};

Ably.prototype.getTests = function() {
    return this.tests;
};

module.exports = Ably;
