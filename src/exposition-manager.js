'use strict';

var ExpositionManager = function(scope, namespace) {
    this.scope = scope;
    this.namespace = namespace;
};

ExpositionManager.prototype.getExposition = function getExposition(test) {
    var data = this.scope.load();
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

ExpositionManager.prototype.registerExposition = function registerExposition(test, variant) {
    var data = this.scope.load();
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

    this.scope.save(data);
};

module.exports = ExpositionManager;
