'use strict';

var ExpositionManager = function(namespace) {
    this.namespace = namespace;
};

ExpositionManager.prototype.getExposition = function getExposition(scope, test) {
    var data = scope.load();
    if (data === null) {
        return null;
    }

    if (!data.hasOwnProperty('namespaces')) {
        return null;
    }

    var namespaces = data.namespaces;
    if (!namespaces.hasOwnProperty(this.namespace)) {
        return null;
    }

    var expositions = namespaces[this.namespace];
    if (!expositions.hasOwnProperty(test)) {
        return null;
    }

    return expositions[test];
};

ExpositionManager.prototype.registerExposition = function registerExposition(scope, test, variant) {
    var data = scope.load();
    if (data === null) {
        data = {};
    }

    if (!data.hasOwnProperty('namespaces')) {
        data.namespaces = {};
    }

    var namespaces = data.namespaces;
    if (!namespaces.hasOwnProperty(this.namespace)) {
        namespaces[this.namespace] = {};
    }

    var expositions = namespaces[this.namespace];
    if (!expositions.hasOwnProperty(test)) {
        expositions[test] = {
            variant: variant,
            date: new Date()
        };
    }

    scope.save(data);
};

ExpositionManager.prototype.purgeOldExpositions = function purgeOldExpositions(scope, cutoffDate) {
    var data = scope.load();
    if (data === null) {
        return;
    }

    if (!data.hasOwnProperty('namespaces')) {
        return;
    }

    var namespaces = data.namespaces;
    if (!namespaces.hasOwnProperty(this.namespace)) {
        return;
    }

    var expositions = namespaces[this.namespace];
    for (var key in expositions) {
        if (expositions.hasOwnProperty(key)) {
            var exposition = expositions[key],
                date;
            if (typeof exposition.date === 'object' && exposition.date instanceof Date) {
                date = exposition.date;
            } else if (typeof exposition.date === 'string') {
                date = new Date(exposition.date);
            } else {
                throw new Error('exposition date is expected to be a Date or a string');
            }

            if (date < cutoffDate) {
                delete expositions[key];
            }
        }
    }

    scope.save(data);
};

module.exports = ExpositionManager;
