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

### Subsribing to variants

```js
ably
    // Subscribe to test 'thank-you-action' variant 'alert'
    .on('thank-you-action', 'alert', function () {
        $('buy-button').on('click', function() {
            alert('Thank you!');
        });
    })
    // Subscribe to test 'thank-you-action' variant 'redirect'
    .on('thank-you-action', 'redirect', function () {
        $('buy-button').on('click', function() {
            location.href = '/thank-you-page.html';
        });
    });
```

## API Reference

Read more about all supported options in the [Documentation](docs/index.md).

## Browser tests

BrowserStack has gracefully agreed to provide us with a sponsored plan. We will soon start relying on their infrastructure to run automated browser tests.

![BrowserStack logo](docs/browserstack-logo.png)