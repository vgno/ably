'use strict';

var scopes = {
    pageView: function(storage) {
        return {
            hasItem: function(key) {
                return storage.hasOwnProperty(key);
            },
            getItem: function(key) {
                return storage[key];
            },
            setItem: function(key, value) {
                storage[key] = value;
            },
            isAvailable: function() {
                return true;
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
