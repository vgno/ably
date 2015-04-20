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

        function uniformRandomizer(callback, variants) {
            callback(variants[Math.floor(Math.random() * variants.length)]);
        }

        this.tests = [];
        this.pendingSubscribers = [];
        this.randomizers = {
            uniform: uniformRandomizer,
            'default': uniformRandomizer
        };
        this.randomizer = this.randomizers['default'];

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

            var randomizer;
            if (!options.hasOwnProperty('randomizer')) {
                randomizer = this.randomizers['default'];
            } else {
                if (typeof options.randomizer === 'function') {
                    randomizer = options.randomizer;
                } else {
                    if (!this.randomizers.hasOwnProperty(options.randomizer)) {
                        throw new Error('randomizer \'' + options.randomizer + '\' not found');
                    }
                    randomizer = this.randomizers[options.randomizer];
                }
            }

            var test = new AblyTest({
                name: options.name,
                variants: options.variants,
                randomizer: randomizer,
                scope: options.scope
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
