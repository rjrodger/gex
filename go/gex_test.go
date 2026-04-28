// Copyright (c) 2013-2026 Richard Rodger and other contributors, MIT License

package gex

import (
	"math"
	"reflect"
	"testing"
	"time"
)

func expectEqual(t *testing.T, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("expected %#v, got %#v", want, got)
	}
}

func TestHappy(t *testing.T) {
	ab := New("ab")
	expectEqual(t, ab.On("ab"), "ab")
	expectEqual(t, ab.On("a"), nil)
	expectEqual(t, ab.On("b"), nil)
	expectEqual(t, ab.On("ba"), nil)
	expectEqual(t, ab.On("abc"), nil)
	expectEqual(t, ab.On("cab"), nil)
	expectEqual(t, ab.On("cabc"), nil)

	aStarB := New("a*b")
	expectEqual(t, aStarB.On("acb"), "acb")
	expectEqual(t, aStarB.On("adb"), "adb")
	expectEqual(t, aStarB.On("aab"), "aab")
	expectEqual(t, aStarB.On("abb"), "abb")

	expectEqual(t, aStarB.On("aaa"), nil)
	expectEqual(t, aStarB.On("bbb"), nil)
	expectEqual(t, aStarB.On("bca"), nil)
	expectEqual(t, aStarB.On("ba"), nil)
	expectEqual(t, aStarB.On("ac"), nil)
	expectEqual(t, aStarB.On("a"), nil)

	aQB := New("a?b")
	expectEqual(t, aQB.On("acb"), "acb")
	expectEqual(t, aQB.On("adb"), "adb")
	expectEqual(t, aQB.On("aab"), "aab")
	expectEqual(t, aQB.On("abb"), "abb")

	expectEqual(t, aQB.On("aaa"), nil)
	expectEqual(t, aQB.On("bbb"), nil)
	expectEqual(t, aQB.On("bca"), nil)
	expectEqual(t, aQB.On("ba"), nil)
	expectEqual(t, aQB.On("ac"), nil)
	expectEqual(t, aQB.On("a"), nil)

	expectEqual(t, aStarB.On("accb"), "accb")
	expectEqual(t, aStarB.On("acccb"), "acccb")
	expectEqual(t, aStarB.On("aaab"), "aaab")
	expectEqual(t, aStarB.On("aabb"), "aabb")
	expectEqual(t, aStarB.On("abbb"), "abbb")
}

func TestArrays(t *testing.T) {
	g := New("a*")
	expectEqual(t, g.On([]string{"ab", "ac"}), []any{"ab", "ac"})
	expectEqual(t, g.On([]string{"ab", "dd", "ac"}), []any{"ab", "ac"})
	expectEqual(t, g.On([]string{"ab", "dd", "ee"}), []any{"ab"})
	expectEqual(t, g.On([]string{"ff", "dd", "ee"}), []any{})
	expectEqual(t, g.On([]string{}), []any{})

	expectEqual(t, g.On([]any{nil}), []any{})
	expectEqual(t, g.On([]any{"ab", nil, "dd", "ee", math.NaN()}), []any{"ab"})
}

func TestObjects(t *testing.T) {
	g := New("foo*")
	expectEqual(t, g.On(map[string]any{"foo": 1}), map[string]any{"foo": 1})
	expectEqual(t, g.On(map[string]any{"foo": 1, "doo": 2}), map[string]any{"foo": 1})
	expectEqual(t, g.On(map[string]any{"foo": 1, "doo": 2, "food": 3}),
		map[string]any{"foo": 1, "food": 3})

	expectEqual(t, g.On(map[string]int{"foo": 1, "doo": 2}), map[string]any{"foo": 1})
}

func TestDodgy(t *testing.T) {
	expectEqual(t, New().On("aaa"), nil)

	g := New("g")
	expectEqual(t, g.On(nil), nil)
	expectEqual(t, g.On(true), nil)
	expectEqual(t, g.On(false), nil)
	expectEqual(t, g.On(time.Now()), nil)
	expectEqual(t, g.On(math.NaN()), nil)
	expectEqual(t, g.On(""), nil)
}

func TestEscapes(t *testing.T) {
	g := New("a**b")
	expectEqual(t, g.String(), "Gex[a**b]")
	expectEqual(t, g.Re().String(), `^a\*b$`)
	expectEqual(t, g.On("a*b"), "a*b")
	expectEqual(t, g.On("a**b"), nil)

	g = New("a*?b")
	expectEqual(t, g.String(), "Gex[a*?b]")
	expectEqual(t, g.Re().String(), `^a\?b$`)
	expectEqual(t, g.On("a?b"), "a?b")
	expectEqual(t, g.On("a*?b"), nil)

	expectEqual(t, g.Esc(""), "")
	expectEqual(t, g.Esc("*"), "**")
	expectEqual(t, g.Esc("?"), "*?")
	expectEqual(t, g.Esc("a*"), "a**")
	expectEqual(t, g.Esc("a?"), "a*?")
	expectEqual(t, g.Esc("a*b*c"), "a**b**c")
	expectEqual(t, g.Esc("a?b?c"), "a*?b*?c")
}

func TestNewlines(t *testing.T) {
	g := New("a*b")
	expectEqual(t, g.Re().String(), `^a[\s\S]*b$`)
	expectEqual(t, g.On("a\nb"), "a\nb")
}

func TestZero(t *testing.T) {
	expectEqual(t, New("0").On("0"), "0")
	expectEqual(t, New("0*").On("0"), "0")
	expectEqual(t, New("*0").On("0"), "0")
	expectEqual(t, New("*0*").On("0"), "0")

	expectEqual(t, New("0").On(0), 0)
	expectEqual(t, New("1").On(1), 1)
	expectEqual(t, New("100").On(100), 100)
}

func TestMulti(t *testing.T) {
	g := New("a", "b")
	expectEqual(t, g.On("a"), "a")
	expectEqual(t, g.On("b"), "b")

	keys := g.Specs()
	expectEqual(t, keys, []string{"a", "b"})

	rmap := g.ReMap()
	if _, ok := rmap["a"]; !ok {
		t.Errorf("ReMap missing 'a'")
	}
	if _, ok := rmap["b"]; !ok {
		t.Errorf("ReMap missing 'b'")
	}
	if g.Re() != nil {
		t.Errorf("Re() should be nil for multi-spec Gex")
	}

	g = New("a*", "b")
	expectEqual(t, g.On("ax"), "ax")
	expectEqual(t, g.On("b"), "b")

	expectEqual(t, New("a*", "b*").On("bx"), "bx")
	expectEqual(t, New("a*", "b*").On([]string{"ax", "zz", "bx"}), []any{"ax", "bx"})
}

func TestInspect(t *testing.T) {
	g := New("a*")
	expectEqual(t, g.String(), "Gex[a*]")
	expectEqual(t, g.Inspect(), "Gex[a*]")

	g = New("a*", "*b")
	expectEqual(t, g.Inspect(), "Gex[a*,*b]")
}

func TestFunky(t *testing.T) {
	expectEqual(t, New("").On("a"), nil)
	expectEqual(t, New().On("a"), nil)
}

func TestMatch(t *testing.T) {
	g := New("a*")
	if !g.Match("abc") {
		t.Errorf("expected 'abc' to match 'a*'")
	}
	if g.Match("xyz") {
		t.Errorf("expected 'xyz' not to match 'a*'")
	}
}

func TestEscPackage(t *testing.T) {
	if Esc("a*b") != "a**b" {
		t.Errorf("package-level Esc broke")
	}
}
