# API Reference

## Architecture

Ably contains a collection of *experiments*.

Each *experiment* has its own *sampler* and its own *scope*.

### Sampler ###

A sampler assigns test subjects to groups.

### Scope

A scope marks the boundary of where the experiment begins and where it ends.

## Defining tests

### `ably.addTest(options)`

Define a test.

| Parameter            | Type                   | Required                     | Description
| -------------------- | :--------------------- | ---------------------------- | :--------------------------------------
| `options.name`       | `string`               | Yes                          | Name of the test. It has to be unique.
| `options.variants`   | `array(string)`        | Yes                          | Possible variants (A, B, C).
| `options.sampler`    | `string` or `function` | No (default: `'local'`) | A sampler assigns test subjects to groups (`'local'` or a custom function, see the *Samplers* section below).
| `options.scope`      | `string` or `object`   | No (default: `'device'`)     | A scope marks the boundary of where the experiment begins and where it ends (`'device'`, `'memory'` or a custom object, see the *Scopes* section below).
| `options.weights`    | `object(number)`       | No (default: equal weights)  | Map of weights of each variant. A weight is a number. Weights are only used for samplers that support them. (The `local` sampler supports weights.) If this parameter is omitted, equal weights are assumed.

### Samplers

A sampler assigns test subjects to groups.

#### Predefined samplers

##### The `local` sampler

A type of sampler that assigns users to groups locally. In JavaScript it is done using the JavaScript `Math.random()` routine as the seed. If the `weights` option is provided, the sampler will assign to groups with probabilities proportinate to the weights. Otherwise the sampler will assign to groups with roughly equal probabilities. The sampler in JavaScript relies on the uniform distribution of values of the `Math.random()` function.

#### Use your own sampler

Supply a function that matches the following prototype:

```js
/**
 * Assigns to a variant by calling the callback
 * @param  {Function} callback The callback to pass the variant to
 * @param  {AblyTest} test The test being randomized
 */
function sampler(callback, test);
```

Examples:

```js
function myServerGeneratedSampler(callback, test) {
    callback(document.getElementById('server-generated-data').dataset[test.name].assignment);
}
```

```js
function myServerGeneratedSampler(callback, test) {
    $.getJSON("/assigment/" + test.name, function(json) {
        callback(json.assigment);
    });
}
```

### Scopes

A scope marks the boundary of where the experiment begins and where it ends.

#### Predefined scopes

##### The `memory` scope

The experiment lives as long as the temporary in-memory storage is alive. For instance, in browsers users will be reassigned to a new group upon a page reload and will get a new group in other browser windows.

##### The `device` scope

The experiment lives within the scope of a device. In browsers, users will retain their group through page reloads and multiple windows but will get a new group on a different device, if they use private mode or when they clear browser data.

#### Use your own scope

Supply an object that matches the following prototype:

```js
{
    /**
     * Save data in the scope
     * @param   {*} data Data to save in the scope
     */
    save: function(data) {},

    /**
     * Load data from the scope
     * @returns {*} Data loaded from the scope
     */
    load: function() {},

    /**
     * Is scope supported
     * @returns {boolean} True if scope is supported, false otherwise
     */
    isSupported: function() {},
}
```

## Subscribing to tests

### `ably.on(test, variant, callback)`

Subscribe to a variant of a test.

| Parameter  | Type       | Required | Description
| ---------- | :--------- | -------- | :--------------------------------------
| `test`     | `string`   | Yes      | Name of the test to subscribe to.
| `variant`  | `string`   | Yes      | Variant to subscribe to.
| `callback` | `function` | Yes      | Function to call when the variant is chosen.
