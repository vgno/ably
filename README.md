# ably
Provides a framework to perform A/B tests in the browser

## Usage

```js
var ably = new Ably({
    name: 'button-color'
});

ably
    .scenario('red', function (button) {
        button.style.backgroundColor = '#ff0000';
    })
    .scenario('green', function (button) {
        button.style.backgroundColor = '#ff0000';
    })
    .run(document.getElementById('purchase-button'));
```
