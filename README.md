# gex

[![npm version](https://badge.fury.io/js/gex.svg)](https://badge.fury.io/js/gex)
[![Build](https://github.com/rjrodger/gex/workflows/build/badge.svg)](https://github.com/rjrodger/gex/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/rjrodger/gex/badge.svg?branch=main)](https://coveralls.io/github/rjrodger/gex?branch=main)
[![Maintainability](https://api.codeclimate.com/v1/badges/5def990719578771abb3/maintainability)](https://codeclimate.com/github/rjrodger/gex/maintainability)

> *"When regular expressions are just too hard!"*

Glob expressions for JavaScript / TypeScript. `*` matches any run of
characters, `?` matches one character, `**` and `*?` escape literal
`*` and `?`. Patterns are anchored — they must match the whole string.

This README covers the JavaScript / TypeScript package. A Go port lives
in [`go/`](./go) — see [`go/README.md`](./go/README.md) for installation
and API. Matching semantics are the same in both ports.

---

## Tutorial: your first gex

Install:

```sh
npm install gex
```

Build a matcher and try it:

```js
const { Gex } = require('gex')

Gex('a*c').on('abbbc')   // 'abbbc' — match, returns the input
Gex('a?c').on('abc')     // 'abc'   — match
Gex('a*c').on('xyz')     //  null   — no match
```

`on()` returns the input when it matches, or `null` when it doesn't.
Two convenient extensions cover collections:

```js
Gex('a*').on(['ab', 'zz', 'ac'])      // ['ab', 'ac']
Gex('a*').on({ ab: 1, zz: 2, ac: 3 }) // { ab: 1, ac: 3 }
```

A Gex can hold several specs; a value matches if any spec matches:

```js
Gex(['a*', 'b*']).on('bx')                // 'bx'
Gex(['a*', 'b*']).on(['ax', 'zz', 'bx'])  // ['ax', 'bx']
```

That's the whole library.

---

## How-to guides

### Filter a list of files

```js
const fs = require('fs')
fs.readdir('.', (err, files) => {
  const pngs = Gex('*.png').on(files)
})
```

### Filter an object's keys

```js
Gex('foo*').on({ foo: 1, doo: 2, food: 3 })
// { foo: 1, food: 3 }
```

Property values are copied by reference. The traversal does not recurse
into nested objects or arrays.

### Make a fuzzy assertion in a test

When a value has fields that are noisy in tests (timestamps, random
ids), pattern-match the JSON form:

```js
const entity = { created: Date.now(), name: 'foo' }
assert.ok(Gex('{"created":*,"name":"foo"}').on(JSON.stringify(entity)))
```

### Combine several patterns

```js
Gex(['*.png', '*.jpg']).on(files)
```

A value matches if any of the supplied specs match. Specs are tried in
array order; the first match wins.

### Escape literal `*` or `?`

```js
Gex('a**b').on('a*b')   // 'a*b' — '**' is a literal '*'
Gex('a*?b').on('a?b')   // 'a?b' — '*?' is a literal '?'
```

`g.esc(s)` doubles `*` to `**` and `?` to `*?` for you, so user-supplied
text can be embedded safely:

```js
Gex('').esc('a*b?c')   // 'a**b*?c'
```

### Inspect the compiled regex

```js
Gex('a*b').re()           // /^a[\s\S]*b$/
Gex(['a', 'b']).re()      // { a: /^a$/, b: /^b$/ }
Gex('a*').toString()      // 'Gex[a*]'
```

---

## Reference

### `Gex(spec)`

Construct a Gex. `spec` is one of:

| Type                                       | Treated as                                |
| ------------------------------------------ | ----------------------------------------- |
| `string`                                   | one glob spec                             |
| `string[]`                                 | several glob specs (any-of)               |
| `number` / `boolean` / `Date` / `RegExp`   | stringified, then one spec                |
| `null` / `undefined` / `NaN`               | a Gex that never matches                  |

### `.on(value)`

| Input                                                 | Returns                                              |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `string` / `number` / `boolean` / `Date` / `RegExp`   | the input if its string form matches, else `null`    |
| array                                                 | new array of matching elements (not recursive)       |
| object                                                | new object with entries whose **keys** match         |
| `null` / `undefined` / `NaN`                          | `null`                                               |

### `.match(value)`

The boolean form of `.on()` for scalars: `true` if the value's string
form matches any spec, otherwise `false`.

### `.esc(s)`

Escape `*` and `?` so the result, used as a spec, matches the input
literally.

### `.re()`

Returns the compiled `RegExp` if the Gex has a single spec, or the
`{ spec: RegExp }` map otherwise.

### `.toString()` / `.inspect()`

Render as `Gex[spec1,spec2,...]`.

---

## Explanation

**Why a separate library when JS has regex?** Glob syntax is shorter,
easier to read at a glance, and easier to assemble from user-supplied
input than a regex. `gex` is a thin compiler from glob to anchored
regex plus a small filtering API for arrays and objects.

**How the regex is built.** Specs are anchored (`^...$`); `*` becomes
`[\s\S]*` and `?` becomes `[\s\S]`, so patterns cross newlines. `**`
and `*?` round-trip back to literal `\*` and `\?` after escaping, so
escaping composes correctly.

**What `.on()` is for.** It collapses three common shapes into one
call: "is this string a match?", "which of these strings match?", and
"which of these keys match?". The same Gex object handles all three.

**Use cases the API is shaped around.**

- Plugin name matching (`Gex('seneca-*')` to recognise plugin packages).
- Filtering filenames returned by `fs.readdir`.
- Test assertions on JSON snapshots where timestamps or UUIDs are
  irrelevant — pattern-match those fields with `*`.

**Other languages.** The Go port in [`go/`](./go) shares the same
matching semantics. The Go API differs where Go's type system makes a
different shape natural — see [`go/README.md`](./go/README.md) for the
details.

---

## License

Copyright (c) 2010-2026, Richard Rodger and other contributors.
Licensed under [MIT](./LICENSE.txt).
