# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)

Provides a sane model for dealing with A/B tests.

## Install

Using npm:

```bash
npm install vgno-ably --save
```

Using bower:

```bash
bower install vgno-ably --save
```

## Usage

### Defining tests

```js
var Ably = require('vgno-ably');

var ably = new Ably();

ably.addTest({
    name: 'button-color',
    sampler: ably.samplers.default({
        red: 80,
        green: 20
    }),
    scope: 'device'
});
```

The code above will create a test named `button-color`, sample 80% of people to the `red` variant and 20% to the `green` one and persist information about the experiment on the device - so that the user will get always the same variant on this device.

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

Subscribe to all variants of a test:

```js
ably
    .on('button-color', function (test) {
        $('#buy-button').css('background-color', test.getAssignment());
    });
```

## Model

Ably contains a collection of *experiments*.

An *experiment* has:
 * a *name*
 * a *sampler* which assigns users to variants
 * a *scope* which persists information about the experiment

## API Reference

Read more about all supported options in the [Documentation](docs/index.md).

## Browser tests

BrowserStack has gracefully agreed to provide us with a sponsored plan. We will soon start relying on their infrastructure to run automated browser tests.

![BrowserStack logo](docs/browserstack-logo.png)
