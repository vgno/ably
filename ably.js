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

        function uniformRandomizer(callback, test) {
            callback(test.variants[Math.floor(Math.random() * test.variants.length)]);
        }

        function interpretRandomizerOptions(options) {
            if (!options.hasOwnProperty('randomizer')) {
                return self.randomizers['default'];
            }

            if (typeof options.randomizer === 'function') {
                return options.randomizer;
            }

            if (self.randomizers.hasOwnProperty(options.randomizer)) {
                return self.randomizers[options.randomizer];
            }

            throw new Error('randomizer \'' + options.randomizer + '\' not found');
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

        var objectScopeStorage = {},
            objectScope = {
                hasItem: function(key) {
                    return objectScopeStorage.hasOwnProperty(key);
                },
                getItem: function(key) {
                    return objectScopeStorage[key];
                },
                setItem: function(key, value) {
                    objectScopeStorage[key] = value;
                }
            };

        this.tests = [];
        this.pendingSubscribers = [];
        this.randomizers = {
            uniform: uniformRandomizer,
            'default': uniformRandomizer
        };
        this.scopes = {
            object: objectScope,
            'default': objectScope
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
                randomizer: interpretRandomizerOptions(options),
                scope: interpretScopeOptions(options)
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
