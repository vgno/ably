'use strict';

var samplers = {
    uniform: function uniformSampler(callback, test) {
        callback(test.variants[Math.floor(Math.random() * test.variants.length)]);
    },

    mathRandom: function mathRandomSampler(callback, test) {
        var total = 0,
            current = 0,
            random,
            variant;

        if (typeof test.weights === 'undefined') {
            samplers.uniform(callback, test);
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
};

module.exports = samplers;
