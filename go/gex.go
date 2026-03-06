// Copyright (c) 2011-2024 Richard Rodger, MIT License

// Package gex provides glob expressions for Go.
// It supports * (match zero or more characters) and ? (match exactly one character).
// Use ** to match a literal * and *? to match a literal ?.
package gex

import (
	"regexp"
	"strings"
)

// Gexer holds compiled glob patterns and provides matching operations.
type Gexer struct {
	gexmap map[string]*regexp.Regexp
}

// New creates a Gexer from one or more glob pattern strings.
func New(patterns ...string) *Gexer {
	g := &Gexer{gexmap: make(map[string]*regexp.Regexp)}
	for _, p := range patterns {
		g.gexmap[p] = g.Re(p)
	}
	return g
}

// Re compiles a glob expression string into a regexp.
func (g *Gexer) Re(gs string) *regexp.Regexp {
	es := escapeRegexp(gs)

	// * -> match any (including newlines)
	es = strings.ReplaceAll(es, `\*`, `[\s\S]*`)
	// ? -> match single char (including newlines)
	es = strings.ReplaceAll(es, `\?`, `[\s\S]`)

	// ** escapes to literal *
	es = strings.ReplaceAll(es, `[\s\S]*[\s\S]*`, `\*`)
	// *? escapes to literal ?
	es = strings.ReplaceAll(es, `[\s\S]*[\s\S]`, `\?`)

	// Now convert the JS-style [\s\S] to Go-style (?s:.)
	es = strings.ReplaceAll(es, `[\s\S]*`, `(?s:.*)`)
	es = strings.ReplaceAll(es, `[\s\S]`, `(?s:.)`)

	es = `^` + es + `$`
	return regexp.MustCompile(es)
}

// ReString returns the JS-style regex string for a glob pattern (for test compatibility).
func (g *Gexer) ReString(gs string) string {
	es := escapeRegexp(gs)

	es = strings.ReplaceAll(es, `\*`, `[\s\S]*`)
	es = strings.ReplaceAll(es, `\?`, `[\s\S]`)

	es = strings.ReplaceAll(es, `[\s\S]*[\s\S]*`, `\*`)
	es = strings.ReplaceAll(es, `[\s\S]*[\s\S]`, `\?`)

	return `/^` + es + `$/`
}

// Match returns true if str matches any of the glob patterns.
func (g *Gexer) Match(str string) bool {
	for _, re := range g.gexmap {
		if re.MatchString(str) {
			return true
		}
	}
	return false
}

// On tests a string against the glob patterns.
// Returns the string if it matches, or empty string and false if not.
func (g *Gexer) On(str string) (string, bool) {
	if g.Match(str) {
		return str, true
	}
	return "", false
}

// OnArray filters a string slice, returning only matching elements.
func (g *Gexer) OnArray(strs []string) []string {
	out := make([]string, 0)
	for _, s := range strs {
		if g.Match(s) {
			out = append(out, s)
		}
	}
	return out
}

// OnMap filters a map by keys, returning a new map with only matching keys.
func (g *Gexer) OnMap(m map[string]any) map[string]any {
	out := make(map[string]any)
	for k, v := range m {
		if g.Match(k) {
			out[k] = v
		}
	}
	return out
}

// Esc escapes * and ? characters in a string so they match literally.
// * becomes ** and ? becomes *?
func (g *Gexer) Esc(s string) string {
	s = strings.ReplaceAll(s, "*", "**")
	s = strings.ReplaceAll(s, "?", "*?")
	return s
}

// String returns a description of the Gexer.
func (g *Gexer) String() string {
	keys := make([]string, 0, len(g.gexmap))
	for k := range g.gexmap {
		keys = append(keys, k)
	}
	return "Gex[" + strings.Join(keys, ",") + "]"
}

// escapeRegexp escapes special regexp metacharacters.
func escapeRegexp(s string) string {
	special := `[-[\]{}()*+?.,\\^$|#` + "\t\n\r\f\v ]"
	re := regexp.MustCompile(`[` + regexp.QuoteMeta(special) + `]`)
	return re.ReplaceAllStringFunc(s, func(m string) string {
		return `\` + m
	})
}
