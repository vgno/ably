# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)![Status](https://img.shields.io/badge/maturity-unstable-red.svg?style=flat-square)

Provides a framework to perform A/B tests in the browser. This is still work in progress.

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

Subscribe to variants using one of the exposed APIs.

## APIs

Ably exposes three APIs: JS, HTML and CSS.

![Ably interface](docs/ably-interface.png)

### JS API

Use it to alternate **behaviour**.

```js
ably
    // Subscribe to test 'thank-you-action' variant 'alert'
    .when('thank-you-action', 'alert', function () {
        $('buy-button').on('click', function() {
            alert('Thank you!');
        });
    })
    // Subscribe to test 'thank-you-action' variant 'redirect'
    .when('thank-you-action', 'redirect', function () {
        $('buy-button').on('click', function() {
            location.href = '/thank-you-page.html';
        });
    });
```

### HTML API

Use it to alternate **content**.

```html
  <!-- Test 'button-text' variant 'buy' -->
  <button class="ably-button-text-buy">
    Buy Now!
  </button>

  <!-- Test 'button-text' variant 'buy' -->
  <button class="ably-button-text-subscribe">
    Subscribe!
  </button>
```

Ably will only show the selected variant.

### CSS API

Use it to alternate **styling**.

```css
/* Test 'button-color' variant 'red' */
body.ably-button-color-red #buy-now-button
    background-color: red;
}

/* Test 'button-color' variant 'green' */
body.ably-button-color-green #buy-now-button
    backgrond-color: green;
}
```

## API Reference

Read more about all supported options in the [API Reference](docs/api.md).

## Architecture

Read more about the architecture in [Architecture](docs/architecture.md).
