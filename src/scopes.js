'use strict';

var scopes = {
    objectStorage: function(object) {
        return {
            save: function(data) {
                object = data;
            },
            load: function() {
                return object;
            },
            isAvailable: function() {
                return typeof object === 'object' && object !== null;
            }
        };
    },
    localStorage: {
        save: function(data) {
            localStorage.setItem('__ably', JSON.stringify(data));
        },
        load: function() {
            return JSON.parse(localStorage.getItem('__ably'));
        },
        isAvailable: function() {
            var testKey = '__test_localStorage_capability_ably_18c09e96bdd2cfe6ca47f3285f1b935d',
                testValue = '12345';
            try {
                var storage = window.localStorage;
                storage.setItem(testKey, testValue);
                var value = storage.getItem(testKey);
                storage.removeItem(testKey);
                return value === testValue;
            } catch (error) {
                return false;
            }
        }
    }
};

module.exports = scopes;
