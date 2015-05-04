(function (root, factory) {
    'use strict';

    /* istanbul ignore next: untestable with Node-style definition */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['ably-test', 'ably-subscriber'], factory);
    } else {
        /* istanbul ignore else: untestable with Node-style definition */
        if (typeof exports === 'object') {
            // Node-style
            module.exports = factory(require('./ably-test.js'), require('./ably-subscriber.js'));
        } else {
            // Browser globals (root is window)
            root.Ably = factory(root.AblyTest, root.AblySubscriber);
        }
    }
}(this, function (AblyTest, AblySubscriber) {
    'use strict';

    var Ably = function Ably() {

        function relayPendingSubscribers(test) {

            var unmatchedSubscribers = [];

            self.pendingSubscribers.forEach(function(pendingSubscriber) {
                if (pendingSubscriber.matchesTest(test)) {
                    test.addSubscriber(pendingSubscriber);
                } else {
                    unmatchedSubscribers.push(pendingSubscriber);
                }
            });

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
                return uniformSampler(callback, test);
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
                return self.samplers['default'];
            }

            if (typeof options.sampler === 'function') {
                return options.sampler;
            }

            if (self.samplers.hasOwnProperty(options.sampler)) {
                return self.samplers[options.sampler];
            }

            throw new Error('sampler \'' + options.sampler + '\' not found');
        }

        function interpretScopeOptions(options) {
            if (!options.hasOwnProperty('scope')) {
                return self.scopes['default'];
            }

            if (typeof options.scope === 'object') {
                return options.scope;
            }

            if (self.scopes.hasOwnProperty(options.scope)) {
                return self.scopes[options.scope];
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
                }
            },
            deviceScope = {
                hasItem: function(key) {
                    return localStorage.getItem(key) !== null;
                },
                getItem: function(key) {
                    return localStorage.getItem(key);
                },
                setItem: function(key, value) {
                    localStorage.setItem(key, value);
                }
            };

        this.tests = [];
        this.pendingSubscribers = [];
        this.samplers = {
            local: mathRandomSampler,
            'default': mathRandomSampler
        };
        this.scopes = {
            pageview: pageViewScope,
            device: deviceScope,
            'default': deviceScope
        };

        var self = this;

        // Privileged methods
        this.when = function (testName, variant, callback) {

            var subscriber = new AblySubscriber({
                test: testName,
                variant: variant,
                callback: callback
            });
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

        this.addTest = function (options) {

            var test = new AblyTest({
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

    Ably.prototype.addTests = function (tests) {
        var self = this;
        tests.forEach(function(test) {
            self.addTest(test);
        });
        return this;
    };

    Ably.prototype.getTest = function (name) {
        for (var i = 0; i < this.tests.length; i++) {
            if (this.tests[i].name === name) {
                return this.tests[i];
            }
        }
        throw new Error('test \'' + name + '\' not found');
    };

    Ably.prototype.getTests = function () {
        return this.tests;
    };

    return Ably;
}));
