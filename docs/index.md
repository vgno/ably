# API Reference

## Defining tests

### `ably.addTest(options)`

Define a test.

| Parameter            | Type                   | Required                     | Description
| -------------------- | :--------------------- | ---------------------------- | :--------------------------------------
| `options.name`       | `string`               | Yes                          | Name of the test. It has to be unique.
| `options.sampler`    | `function`             | Yes                          | A sampler assigns test subjects to groups (`ably.samplers.default` supplied with an array of variants will generate a sampler, see the *Samplers* section below).
| `options.scope`      | `string` or `object`   | No (default: `'device'`)     | A scope marks the boundary of where the experiment begins and where it ends (`'device'`, `'memory'` or a custom object, see the *Scopes* section below).

### Samplers

A sampler assigns test subjects to groups.

#### Predefined samplers

##### `ably.samplers.default`

Supplied with an array of variants, it will generate a sampler that assigns users to groups with a uniform distribution.

Example:

```js
ably.samplers.default([a,b,c])
```

Supplied with an object, it will treat it as mapping between variants and their weights and generate an according sampler.

Example:

```js
ably.samplers.default({
    a: 50,
    b: 25,
    c: 15
})
```

#### Use your own sampler

Supply a function that matches the following prototype:

```js
/**
 * Assigns to a variant.
 * @param  {AblyTest} test The test being randomized
 * @return {String} The assigned variant.
 */
function sampler(test) {
    return 'a';
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

#### Registering scopes

If you want Ably to manage your scope and be able to purge old expositions, you may register it with `registerScope`.

```js
ably.registerScope('myScope', myScopeObj);
```

Then refer to it by name when adding your tests.

```js
ably.addTest({
  name: 'myExperiment',
  sampler: ably.samplers.default(),
  scope: 'myScope'
});
```

## Subscribing to tests

### `ably.on(test, variant, callback)`

Subscribe to a particular variant of a test.

| Parameter  | Type       | Required | Description
| ---------- | :--------- | -------- | :--------------------------------------
| `test`     | `string`   | Yes      | Name of the test to subscribe to.
| `variant`  | `string`   | Yes      | Variant to subscribe to.
| `callback` | `function` | Yes      | Function to call when the variant is chosen.

### `ably.on(test, callback)`

Subscribe to any variant of a test.

| Parameter  | Type       | Required | Description
| ---------- | :--------- | -------- | :--------------------------------------
| `test`     | `string`   | Yes      | Name of the test to subscribe to.
| `callback` | `function` | Yes      | Function to call when the variant is chosen.
