# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)

Provides a practical front-end API for defining what test variants look like (under A/B or multivariate testing) in separation from test administration. Link it to your test administration backend or use the included basic front-end sampler to get started.

## Usage example

### 1. Define your tests

```js
// Add a test
ably.addTest({
    name: 'button-color',
    variants: ['red', 'green']
});
```

### 2. Subscribe to variants

Subscribe to variants using the exposed API.

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