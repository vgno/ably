'use strict';

require.config({
    paths: {
        Ably: '/ably.min'
    }
});

/* global define */
define(['Ably'], function(Ably) {
    var ably = new Ably();
    return ably;
});
