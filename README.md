# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)![Status](https://img.shields.io/badge/maturity-unstable-red.svg?style=flat-square)

Provides a framework to perform A/B tests in the browser. This is still work in progress.

## Usage example

### 1. Define your tests

```js
// Add a test
ably.addTest({
    name: 'button-color',
    variants: ['red', 'green'],
    randomizer: 'uniform',
    scope: 'cookie'
});
```

### 2. Subscribe to variants

Subscribe to variants using of the APIs:
 - JS API
 - HTML API
 - CSS API

See below for details.

## APIs

Ably exposes three APIs: JS, HTML and CSS.

![Ably interface](docs/ably-interface.png)

### JS API

Use it to alternate **behaviour**.

```js
ably
    // Subscribe to test 'thank-you-action' variant 'alert'
    .when('thank-you-action', 'alert', function () {
        $('buy-button').click(function() {
            alert('Thank you!');
        });
    })
    // Subscribe to test 'thank-you-action' variant 'redirect'
    .when('thank-you-action', 'redirect', function () {
        $('buy-button').click(function() {
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

If you want to style the following button:

```html
  <button id="buy-now-button">
    Buy Now!
  </button>
```

use the following CSS selectors:

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

### Why HTML & CSS APIs?

It is possible to implement any A/B test using the JS API only.

Using the HTML & CSS APIs is recommended when you want to vary **content** or **styling** for the following reasons:

 - **performance**
   
   Using the HTML & CSS APIs offloads variation of content and styling to the browser. It empowers the browser to style elements while the DOM is still parsed which helps avoid the lag related to manipulation of DOM elements via JavaScript. 

 - **separation of concerns**

   Using the HTML & CSS APIs allows to keep content and styling with other content and styling.

## Architecture

Read more about the architecture in [Architecture](docs/architecture.md).
