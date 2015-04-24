## Architecture

Ably contains a collection of *experiments*.

Each *experiment* has its own *randomizer* and its own *scope*.

![Ably experiment architecture](ably-experiment-architecture.png)

### Randomizer ###

A randomizer assigns test subjects to groups.

#### Use an existing randomizer

Ably exposes a randomizer you can use out of the box.

##### The `uniform` randomizer

A type of randomizer that assigns users to groups with equal probability of being assigned to each group. The uniform randomizer relies on the uniform distribution of values of the `Math.random()` function.

Usage example:

```js
// Add a test
ably.addTest({
    name: 'button-color',
    variants: ['red', 'green'],
    randomizer: 'uniform',
    scope: 'cookie'
});
```

#### Supply your own randomizer

A randomizer matches the following prototype:

```js
/**
 * Assigns to a variant by calling the callback
 * @param  {Function} callback The callback to pass the variant to
 * @param  {AblyTest} test The test being randomized
 */
function randomizer(callback, test);
```

##### For a single test

Pass a function as the value of the `randomizer` option when adding a test:

```js
// Add a test
ably.addTest({
    name: 'button-color',
    variants: ['red', 'green'],
    randomizer: function exampleRandomizer(callback, test) {
        callback(test.variants[Math.floor(Math.random() * test.variants.length)]);
    }
});
```

##### As the default randomizer

The *default* randomizer is used for all tests added without a randomizer which have been added after the default randomizer was set. If you didn't set the default randomizer, it is the uniform randomizer by default.

```js
ably.setDefaultRandomizer(function myServerGeneratedRandomizer(callback, test) {
    callback(document.getElementById('server-generated-data').dataset[test.name].assignment);
});
```

```js
ably.setDefaultRandomizer(function myServerGeneratedRandomizer(callback, test) {
    $.getJSON("/assigment/" + test.name, function(json) {
        callback(json.assigment);
    });
});
```

### Scope ###

A scope represents the scope of an experiment. It marks the boundary of where the experiment begins and where it ends. An experiment can be run within the scope of a cookie or within the scope of a logged-in session. A scope is simply a key-value store which remembers the state of an experiment. Specifically, it remembers which group the user was assigned to.

#### Scope Interface ####

The Scope interface is partially consistent with [the Web Storage interface](http://dev.w3.org/html5/webstorage/#storage-0).

| Function                  | Description                              |
| ------------------------- | :--------------------------------------- |
| `.hasItem(key)`           | True if the scope has a value for `key`  |
| `.getItem(key)`           | Get the value under `key`                |
| `.setItem(key, value)`    | Set the value under `key` to `value`     |

#### Example ####

```js
// See if the user was assigned to a group in the 'button-color' experiment
scope.hasItem('button-color');

// Get the group the user was assigned to in the 'button-color' experiment
scope.getItem('button-color');

// Set the group the user was assigned to in the 'button-color' experiment to 'red'
scope.setItem('button-color', 'red');
```
