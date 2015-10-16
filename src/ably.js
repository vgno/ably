'use strict';

var Test = require('./test');
var Subscriber = require('./subscriber');
var samplers = require('./samplers');
var scopes = require('./scopes');
var ExpositionManager = require('./exposition-manager');

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

    function firstAvailableScope(scopeList) {
        var i, scope;
        for (i = 0; i < scopeList.length; i++) {
            scope = scopeList[i];
            if (typeof scope.isAvailable !== 'function' || scope.isAvailable()) {
                return scope;
            }
        }
        throw new Error('no available scope provided');
    }

    function availableScope(scope) {
        return firstAvailableScope([scope, self.scopes.memory]);
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

    if (namespace === undefined) {
        namespace = 'default';
    }
    this.namespace = namespace;
    this.tests = [];
    this.pendingSubscribers = [];
    this.samplers = {
        local: samplers.mathRandom,
        default: samplers.mathRandom
    };
    this.scopes = {
        memory: scopes.objectStorage({}),
        device: scopes.localStorage,
        default: scopes.localStorage
    };
    this.expositionManager = new ExpositionManager(this.namespace);

    // Privileged methods
    this.on = function(testName, variant, callback) {
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
            weights: options.weights,
            expositionManager: this.expositionManager
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

Ably.prototype.purgeOldExpositions = function(cutoffDate) {
    for (var i = 0; i < this.tests.length; i++) {
        this.tests[i].purgeOldExpositions(cutoffDate);
    }
};

module.exports = Ably;
