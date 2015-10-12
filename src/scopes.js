'use strict';

var scopes = {
    objectStorage: function(object) {
        return {
            hasItem: function(key) {
                return object.hasOwnProperty(key);
            },
            getItem: function(key) {
                return object[key];
            },
            setItem: function(key, value) {
                object[key] = value;
            },
            isAvailable: function() {
                return typeof object === 'object' && object !== null;
            }
        };
    },
    localStorage: {
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
    }
};

module.exports = scopes;
