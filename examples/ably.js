'use strict';

require.config({
    paths: {
        Ably: '/ably.min'
    }
});

define(['Ably'], function(Ably) {
    var ably = new Ably();
    return ably;
});
