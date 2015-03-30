(function (root, factory) {
    'use strict';

    /* istanbul ignore next: untestable with Node-style definition */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['ably'], factory);
    } else {
        /* istanbul ignore else: untestable with Node-style definition */
        if (typeof exports === 'object') {
            // Node-style
            module.exports = factory(require('./ably.js'));
        } else {
            // Browser globals (root is window)
            root.ably = factory(root.Ably);
        }
    }
}(this, function (Ably) {
    'use strict';

    return new Ably();
}));
