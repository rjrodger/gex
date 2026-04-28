# gex (Go)

> *"When regular expressions are just too hard!"*

Glob expressions for Go: `*` matches any run of characters, `?` matches
one character, `**` and `*?` escape literal `*` and `?`. Patterns are
anchored — they must match the whole string.

**Version:** `0.1.1`).

This is the Go port of the [JavaScript / TypeScript `gex`
package](../README.md). Matching semantics are identical; the API
differs where Go's type system makes a different shape natural (see
[Explanation](#explanation)).

---

## Tutorial: your first gex

Install:

```sh
go get github.com/rjrodger/gex/go
```

Build a matcher and try it:

```go
package main

import (
    "fmt"

    gex "github.com/rjrodger/gex/go"
)

func main() {
    g := gex.New("a*b")

    fmt.Println(g.Match("acb"))   // true
    fmt.Println(g.Match("aaab"))  // true
    fmt.Println(g.Match("xyz"))   // false

    fmt.Println(g.On("acb"))      // acb
    fmt.Println(g.On("xyz"))      // <nil>
}
```

`Match` is the boolean form. `On` returns the input when it matches,
`nil` when it doesn't, and extends to filtering slices and maps:

```go
g := gex.New("a*")
g.On([]string{"ab", "zz", "ac"})        // []any{"ab", "ac"}
g.On(map[string]any{"ab": 1, "zz": 2})  // map[string]any{"ab": 1}
```

A Gex can hold several specs; a value matches if any spec matches:

```go
gex.New("a*", "b*").On("bx")  // "bx"
```

That's the whole library.

---

## How-to guides

### Filter a slice of file names

```go
files := []string{"a.png", "a.jpg", "b.png"}
pngs  := gex.New("*.png").On(files)  // []any{"a.png", "b.png"}
```

`On` always returns `[]any` for slice inputs, even when the input is a
typed slice like `[]string`. Convert at the boundary if you need a
typed result.

### Filter a map by key

```go
gex.New("foo*").On(map[string]any{"foo": 1, "doo": 2, "food": 3})
// map[string]any{"foo": 1, "food": 3}
```

Map iteration is randomized in Go, so the returned map is unordered.

### Combine several specs

```go
g := gex.New("a*", "*b")
g.Match("abc")  // true (matched a*)
g.Match("xyb")  // true (matched *b)
```

Specs are tried in insertion order; the first match wins. Duplicates
are ignored.

### Escape literal `*` and `?`

```go
spec := gex.Esc("a*b?c")    // "a**b*?c"
g    := gex.New("prefix-" + spec)
g.Match("prefix-a*b?c")     // true
g.Match("prefix-axyzb_c")   // false (literal '*' and '?' only)
```

`gex.Esc(s)` and the method form `g.Esc(s)` are equivalent — `Esc` does
not depend on receiver state.

### Inspect the compiled regex

```go
gex.New("a*b").Re().String()  // ^a[\s\S]*b$
gex.New("a", "b").ReMap()     // {"a": ^a$, "b": ^b$}
```

`Re()` returns the single compiled regex when the Gex has exactly one
spec, otherwise `nil`; use `ReMap()` for the multi-spec case.

---

## Reference

### `func New(specs ...string) *Gex`

Construct a Gex from one or more glob specs. Empty `New()` produces a
matcher that never matches anything.

### `func Esc(s string) string`

Escape `*` and `?` so the result, used as a spec, matches the input
literally.

### Methods on `*Gex`

| Method                                       | Description                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| `Match(s string) bool`                       | Reports whether `s` matches any spec.                                      |
| `On(obj any) any`                            | Filter `obj`: returns the matched value, a `[]any`, a `map[string]any`, or `nil`. |
| `Esc(s string) string`                       | Method form of the package-level `Esc`.                                    |
| `Re() *regexp.Regexp`                        | The compiled regex if exactly one spec; otherwise `nil`.                   |
| `ReMap() map[string]*regexp.Regexp`          | Copy of the spec→regex map.                                                |
| `Specs() []string`                           | Spec strings in insertion order.                                           |
| `String() string` / `Inspect() string`       | `Gex[spec1,spec2,...]`.                                                    |

### Behavior of `On(obj any)` by input kind

| Input kind                                | Returns                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `nil`                                     | `nil`                                                                         |
| `string`                                  | the string if it matches, else `nil`                                          |
| numeric / `bool`                          | the original value if its `strconv` form matches, else `nil`                  |
| `float64`/`float32` `NaN`                 | `nil`                                                                         |
| slice / array                             | `[]any` of matching elements; `nil` and `NaN` entries are dropped             |
| map                                       | `map[string]any` of entries with keys that match                              |
| struct                                    | the struct if its `fmt.Sprint` form matches, else `nil`                       |
| pointer / interface                       | dereferenced, then re-dispatched                                              |

### Constants

```go
const Version = "0.1.0"
```

---

## Explanation

**Why both `Match` and `On`?** `Match` is the obvious bool form. `On`
mirrors the JS API: give it a value and it filters in the shape of the
input — a string stays a string, a slice comes back as a smaller slice,
a map comes back with non-matching keys removed. Mirroring that requires
`any` at both edges; if you only need a yes/no answer, use `Match`.

**Slice and map outputs are always `[]any` / `map[string]any`.** Returning
a typed result would require generics on every call site or per-type
methods. `[]any` keeps the API small; convert at the boundary if you
need typed output.

**Regex engine.** Go's `regexp` package uses RE2, not PCRE. Compiled
patterns use `[\s\S]` (any char including newlines), so
`gex.New("a*b").Match("a\nb")` returns `true` — same as the JS version.
`Re().String()` returns the source pattern; the JS `g.re().toString()`
returns the JS regex literal form (`/.../`), so the rendered strings
differ even when the engines match the same set.

**Differences from the JS version.** JS accepts `string | string[]` (and
will stringify numbers, booleans, dates, regexes); Go takes
`...string`. JS objects are filtered using `for...in` semantics over
own enumerable keys; Go uses reflect over `map[K]V` and ignores struct
fields. Use the `On` shape when porting; use `Match` plus your own
loop when you want full control.

**No async.** `gex` is purely synchronous in both ports; regex
compilation happens once in `New` and is reused on every call.

For the JS / TypeScript version and broader background, see the
[main README](../README.md).

---

## License

Copyright (c) 2011-2026, Richard Rodger and other contributors.
Licensed under [MIT](../LICENSE.txt).
