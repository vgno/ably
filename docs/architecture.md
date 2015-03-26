## Architecture

Ably contains a collection of *experiments*.

Each *experiment* has its own *randomizer* and its own *scope*.

![Ably experiment architecture](docs/ably-experiment-architecture.png)

### Randomizer ###

A `Randomizer` assigns test subjects to groups.

#### Randomizer Interface ####

| Function | Description                                         |
| -------- | :-------------------------------------------------- |
| `.get()` | Get the assigned group |

#### Example ####

```js
var randomizer = new Randomizer();
// ...
var group = randomizer.get();
console.log('I was assigned to group ' + group);
```

#### MathRandomRandomizer ####

A type of `Randomizer` that assigns users to groups using `Math.random()` function.

```js
var randomizer = new MathRandomRandomizer([
    'red': 40, 
    'green': 60
    ]);
var group = randomizer.get();
console.log('I was assigned to group ' + group + ' using Math.random()');
```

#### StaticRandomizer ####

If you assign users to groups server-side, you can create an instance of `StaticRandomizer` and set the group statically using its `.set(group)` method.

```js
var randomizer = new StaticRandomizer();
randomizer.set('red');
// ...
var group = randomizer.get();
console.log('I was assigned to group ' + group + ' using a prepopulated randomizer');
```

### Scope ###

A `Scope` represents the scope of an experiment. It marks the boundary of where the experiment begins and where it ends. An experiment can be run within the scope of a cookie or within the scope of a logged-in session. Scope is simply a key-value store which remembers the state of an experiment. Specifically, it remembers which group the user was assigned to.

#### Scope Interface ####

| Function           | Description                              |
| ------------------ | :--------------------------------------- |
| `.get(key)`        | Get the value under key `key`            |
| `.set(key, value)` | Set the value under key `key` to `value` |

#### Example ####

```js
var scope = new Scope();

// Get the group the user was assigned to in the 'button-color' experiment
scope.get('button-color');

// Set the group the user was assigned to in the 'button-color' experiment to 'red'
scope.set('button-color', 'red');
```

#### CookieScope ####

```js
var scope = new CookieScope();

// Get the group the user was assigned to from a cookie
scope.get('button-color');

// Set the group the user was assigned to in the cookie
scope.set('button-color', 'red');
```
