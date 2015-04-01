# ably

[![Build Status](http://img.shields.io/travis/vgno/ably/master.svg?style=flat-square)](https://travis-ci.org/vgno/ably)[![Test Coverage](http://img.shields.io/codeclimate/coverage/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)[![Code Climate](http://img.shields.io/codeclimate/github/vgno/ably.svg?style=flat-square)](https://codeclimate.com/github/vgno/ably)![Status](https://img.shields.io/badge/maturity-unstable-red.svg?style=flat-square)

Provides a framework to perform A/B tests in the browser. This is still work in progress.

## Usage example

```js
// Add a test
ably.addTest(
    {
        name: 'button-color',
        variants: ['red', 'green'],
        randomizer: ably.mathRandomRandomizer,
        scope: new CookieScope()
    }
);

// Subscribe to variants
ably
    .when('button-color', 'red', function () {
        $('buy-button').css('background-color', 'red');
    })
    .when('button-color', 'green', function () {
        $('buy-button').css('background-color', 'green');
    });
```

## APIs

Ably exposes three APIs: JS, HTML and CSS.

![Ably interface](docs/ably-interface.png)

### JS API

The JS API allows you to subscribe to different variants.

```js
ably
    .when('button-color', 'red', function () {
        $('buy-button').css('background-color', 'red');
    })
    .when('button-color', 'green', function () {
        $('buy-button').css('background-color', 'green');
    });
```

### HTML & CSS APIs

The goal is to describe A/B variants entirely in HTML & CSS.

Using the HTML & CSS APIs helps avoid the flickering effect that you can observe when you manipulating DOM elements via Javascript. This is achieved by empowering the browser to style elements early, while the DOM is still parsed.

#### HTML API

Let's say you want to find out if `Buy` or `Subscribe` is a better caption for your button.

Define your test in JS:

```js
// Define the test
ably.addTest({
    name: 'button-text',
    variants: ['buy', 'subscribe'],
    randomizer: ably.mathRandomRandomizer,
    scope: new CookieScope()
});
```

Add elements for each variant:

```html
  <button class="ably-button-text-buy">
    Buy Now!
  </button>
  
  <button class="ably-button-text-subscribe">
    Subscribe!
  </button>
```

Ably will only show the selected variant.

Behind the scenes Ably adds the variant that got selected as a class to your `<body>` element

```html
<body class="ably-button-text-buy">
```

...and generates some CSS to make it work.

From this moment on the logic of showing/hiding the variants is offloaded entirely to the browser. This works really fast. The browser knows how to style your elements before they are even parsed!

#### CSS API

HTML:

```html
<!-- Ably automatically appends the selected variant as a class to the body element -->
<body class="ably-button-color-red">

  <button id="buy-now-button">
    Buy Now!
  </button>

</body>
```

CSS:

```css
/*
 * You specify different CSS rules for variants
 */
body.ably-button-color-red #buy-now-button
    background-color: #ff0000;
}

body.ably-button-color-green #buy-now-button
    background-color: #00ff00;
}
```

## Architecture

Read more about the architecture in [Architecture](docs/architecture.md).
