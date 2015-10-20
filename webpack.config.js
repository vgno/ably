'use strict';

module.exports = {
    entry: './src/ably.js',
    output: {
        path: 'dist',
        filename: 'ably.min.js',
        library: 'Ably',
        libraryTarget: 'umd'
    }
};
