'use strict';

var samplers = {
    default: function defaultSampler(variants) {
        return function() {
            var total = 0,
                current = 0,
                random,
                variant;

            if (Array.isArray(variants)) {
                return variants[Math.floor(Math.random() * variants.length)];
            } else if (typeof variants === 'object' && variants !== null) {
                for (variant in variants) {
                    if (variants.hasOwnProperty(variant)) {
                        total += variants[variant];
                    }
                }

                random = Math.random() * total;

                for (variant in variants) {
                    if (variants.hasOwnProperty(variant)) {
                        if (random < current + variants[variant]) {
                            return variant;
                        }
                        current += variants[variant];
                    }
                }
            } else {
                throw new Error('variants is expected to be an Array or an object');
            }
        };
    }
};

module.exports = samplers;
