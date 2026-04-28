// Copyright (c) 2011-2026 Richard Rodger and other contributors, MIT License

// Package gex provides simple glob-style expressions: '*' for any
// run of characters, '?' for any single character, '**' for a
// literal '*', and '*?' for a literal '?'.
package gex

import (
	"fmt"
	"math"
	"reflect"
	"regexp"
	"strconv"
	"strings"
)

// Version is the current version of the gex Go module.
const Version = "0.1.1"

var escRE = regexp.MustCompile(`[-\[\]{}()*+?.,\\^$|#\s]`)

// Gex is a compiled glob-expression matcher built from one or more
// spec strings. Construct with New.
type Gex struct {
	gexmap map[string]*regexp.Regexp
	specs  []string
}

// New constructs a Gex from one or more glob specs. Specs may use
// '*' (zero or more chars) and '?' (one char); '**' and '*?' escape
// to literal '*' and '?'. Calling New with no arguments produces a
// matcher that never matches.
func New(specs ...string) *Gex {
	g := &Gex{
		gexmap: map[string]*regexp.Regexp{},
		specs:  []string{},
	}
	for _, s := range specs {
		if _, ok := g.gexmap[s]; ok {
			continue
		}
		g.specs = append(g.specs, s)
		g.gexmap[s] = compile(s)
	}
	return g
}

// Match reports whether s matches any spec.
func (g *Gex) Match(s string) bool {
	for _, spec := range g.specs {
		if g.gexmap[spec].MatchString(s) {
			return true
		}
	}
	return false
}

// On filters obj against the specs.
//
//   - string / numeric / bool: returns obj if its string form matches, else nil.
//   - slice / array: returns []any of matching elements (nil and NaN entries dropped).
//   - map: returns map[string]any of entries with matching keys.
//   - struct: returns obj if its fmt.Sprint form matches, else nil.
//   - pointer / interface: dereferenced.
//   - nil: returns nil.
func (g *Gex) On(obj any) any {
	if obj == nil {
		return nil
	}

	rv := reflect.ValueOf(obj)
	switch rv.Kind() {
	case reflect.String:
		s := rv.String()
		if g.Match(s) {
			return s
		}
		return nil
	case reflect.Bool:
		if g.Match(strconv.FormatBool(rv.Bool())) {
			return obj
		}
		return nil
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if g.Match(strconv.FormatInt(rv.Int(), 10)) {
			return obj
		}
		return nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if g.Match(strconv.FormatUint(rv.Uint(), 10)) {
			return obj
		}
		return nil
	case reflect.Float32, reflect.Float64:
		f := rv.Float()
		if math.IsNaN(f) {
			return nil
		}
		if g.Match(strconv.FormatFloat(f, 'g', -1, 64)) {
			return obj
		}
		return nil
	case reflect.Slice, reflect.Array:
		out := []any{}
		for i := 0; i < rv.Len(); i++ {
			ev := rv.Index(i)
			if ev.Kind() == reflect.Interface || ev.Kind() == reflect.Pointer {
				if ev.IsNil() {
					continue
				}
				ev = ev.Elem()
			}
			if k := ev.Kind(); k == reflect.Float32 || k == reflect.Float64 {
				if math.IsNaN(ev.Float()) {
					continue
				}
			}
			elem := ev.Interface()
			if g.Match(stringForMatch(elem)) {
				out = append(out, elem)
			}
		}
		return out
	case reflect.Map:
		out := map[string]any{}
		for _, k := range rv.MapKeys() {
			ks := stringForMatch(k.Interface())
			if g.Match(ks) {
				out[ks] = rv.MapIndex(k).Interface()
			}
		}
		return out
	case reflect.Struct:
		s := fmt.Sprintf("%v", obj)
		if g.Match(s) {
			return obj
		}
		return nil
	case reflect.Pointer, reflect.Interface:
		if rv.IsNil() {
			return nil
		}
		return g.On(rv.Elem().Interface())
	}
	return nil
}

// Esc escapes '*' and '?' in s so the result, used as a spec,
// matches the input literally.
func Esc(s string) string {
	s = strings.ReplaceAll(s, "*", "**")
	s = strings.ReplaceAll(s, "?", "*?")
	return s
}

// Esc is the method form of the package-level Esc.
func (g *Gex) Esc(s string) string {
	return Esc(s)
}

// Re returns the compiled regex for the single spec. If the Gex
// has zero or more than one spec, Re returns nil; use ReMap then.
func (g *Gex) Re() *regexp.Regexp {
	if len(g.specs) != 1 {
		return nil
	}
	return g.gexmap[g.specs[0]]
}

// ReMap returns a copy of the spec→regex map.
func (g *Gex) ReMap() map[string]*regexp.Regexp {
	out := make(map[string]*regexp.Regexp, len(g.gexmap))
	for k, v := range g.gexmap {
		out[k] = v
	}
	return out
}

// Specs returns the spec strings in insertion order.
func (g *Gex) Specs() []string {
	out := make([]string, len(g.specs))
	copy(out, g.specs)
	return out
}

// String renders as Gex[spec1,spec2,...], matching the JS toString.
func (g *Gex) String() string {
	return "Gex[" + strings.Join(g.specs, ",") + "]"
}

// Inspect is an alias for String, mirroring the JS API.
func (g *Gex) Inspect() string {
	return g.String()
}

func stringForMatch(v any) string {
	switch x := v.(type) {
	case string:
		return x
	case bool:
		return strconv.FormatBool(x)
	case int:
		return strconv.Itoa(x)
	case int8:
		return strconv.FormatInt(int64(x), 10)
	case int16:
		return strconv.FormatInt(int64(x), 10)
	case int32:
		return strconv.FormatInt(int64(x), 10)
	case int64:
		return strconv.FormatInt(x, 10)
	case uint:
		return strconv.FormatUint(uint64(x), 10)
	case uint8:
		return strconv.FormatUint(uint64(x), 10)
	case uint16:
		return strconv.FormatUint(uint64(x), 10)
	case uint32:
		return strconv.FormatUint(uint64(x), 10)
	case uint64:
		return strconv.FormatUint(x, 10)
	case float32:
		return strconv.FormatFloat(float64(x), 'g', -1, 64)
	case float64:
		return strconv.FormatFloat(x, 'g', -1, 64)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func compile(spec string) *regexp.Regexp {
	gs := escregexp(spec)
	gs = strings.ReplaceAll(gs, `\*`, `[\s\S]*`)
	gs = strings.ReplaceAll(gs, `\?`, `[\s\S]`)
	gs = strings.ReplaceAll(gs, `[\s\S]*[\s\S]*`, `\*`)
	gs = strings.ReplaceAll(gs, `[\s\S]*[\s\S]`, `\?`)
	return regexp.MustCompile("^" + gs + "$")
}

func escregexp(s string) string {
	if s == "" {
		return ""
	}
	return escRE.ReplaceAllString(s, `\${0}`)
}
