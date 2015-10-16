# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)

Provides a sane model for dealing with A/B tests.

## Install

Using npm:

```bash
npm install vgno-ably
```

Using bower:

```bash
bower install vgno-ably
```

## Usage

### Defining tests

```js
var Ably = require('vgno-ably');

var ably = new Ably();

ably.addTest({
    name: 'button-color',
    variants: ['red', 'green'],
    weights: [
        red: 80,
        green: 20
    ],
    sampler: 'local',
    scope: 'device'
});
```

### Subscribing to variants

```js
ably
    .on('button-color', 'red', function () {
        $('#buy-button').css('background-color', 'red');
    })
    .on('button-color', 'green', function () {
        $('#buy-button').css('background-color', 'green');
    });
```

## API Reference

Read more about all supported options in the [Documentation](docs/index.md).

## Browser tests

BrowserStack has gracefully agreed to provide us with a sponsored plan. We will soon start relying on their infrastructure to run automated browser tests.

![BrowserStack logo](docs/browserstack-logo.png)
