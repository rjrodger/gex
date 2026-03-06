package gex

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type tsvRow struct {
	cols []string
	line int
}

func loadTSV(t *testing.T, filename string) []tsvRow {
	t.Helper()
	path := filepath.Join("..", "test", filename)
	f, err := os.Open(path)
	if err != nil {
		t.Fatalf("failed to open %s: %v", path, err)
	}
	defer f.Close()

	var rows []tsvRow
	scanner := bufio.NewScanner(f)
	lineNum := 0
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		cols := strings.Split(line, "\t")
		rows = append(rows, tsvRow{cols: cols, line: lineNum})
	}
	if err := scanner.Err(); err != nil {
		t.Fatalf("error reading %s: %v", path, err)
	}
	return rows
}

func unescapeNewlines(s string) string {
	s = strings.ReplaceAll(s, `\n`, "\n")
	return s
}

func TestMatch(t *testing.T) {
	rows := loadTSV(t, "match.tsv")
	for _, row := range rows {
		if len(row.cols) < 3 {
			continue
		}
		pattern := row.cols[0]
		input := unescapeNewlines(row.cols[1])
		expected := row.cols[2]

		g := New(pattern)
		result, ok := g.On(input)

		if expected == "null" {
			if ok {
				t.Errorf("line %d: Gex(%q).On(%q) = %q, want no match",
					row.line, pattern, input, result)
			}
		} else {
			expectedStr := unescapeNewlines(expected)
			if !ok || result != expectedStr {
				t.Errorf("line %d: Gex(%q).On(%q) = (%q, %v), want (%q, true)",
					row.line, pattern, input, result, ok, expectedStr)
			}
		}
	}
}

func TestEscape(t *testing.T) {
	rows := loadTSV(t, "escape.tsv")
	g := New("*")
	for _, row := range rows {
		if len(row.cols) < 2 {
			continue
		}
		input := row.cols[0]
		expected := row.cols[1]

		result := g.Esc(input)
		if result != expected {
			t.Errorf("line %d: Esc(%q) = %q, want %q",
				row.line, input, result, expected)
		}
	}
}

func TestRe(t *testing.T) {
	rows := loadTSV(t, "re.tsv")
	g := New("*")
	for _, row := range rows {
		if len(row.cols) < 2 {
			continue
		}
		pattern := row.cols[0]
		expectedRe := row.cols[1]

		result := g.ReString(pattern)
		if result != expectedRe {
			t.Errorf("line %d: Re(%q) = %q, want %q",
				row.line, pattern, result, expectedRe)
		}
	}
}

func TestOnArray(t *testing.T) {
	g := New("a*")
	result := g.OnArray([]string{"ab", "dd", "ac"})
	if len(result) != 2 || result[0] != "ab" || result[1] != "ac" {
		t.Errorf("OnArray = %v, want [ab ac]", result)
	}

	result = g.OnArray([]string{"ff", "dd", "ee"})
	if len(result) != 0 {
		t.Errorf("OnArray = %v, want []", result)
	}

	result = g.OnArray([]string{})
	if len(result) != 0 {
		t.Errorf("OnArray = %v, want []", result)
	}
}

func TestOnMap(t *testing.T) {
	g := New("foo*")
	result := g.OnMap(map[string]any{"foo": 1, "doo": 2, "food": 3})
	if len(result) != 2 {
		t.Errorf("OnMap got %d keys, want 2", len(result))
	}
	if result["foo"] != 1 || result["food"] != 3 {
		t.Errorf("OnMap = %v, want {foo:1 food:3}", result)
	}
}

func TestMultiPattern(t *testing.T) {
	g := New("a", "b")
	if _, ok := g.On("a"); !ok {
		t.Error("multi: expected match on 'a'")
	}
	if _, ok := g.On("b"); !ok {
		t.Error("multi: expected match on 'b'")
	}
	if _, ok := g.On("c"); ok {
		t.Error("multi: expected no match on 'c'")
	}

	g2 := New("a*", "b*")
	result := g2.OnArray([]string{"ax", "zz", "bx"})
	if len(result) != 2 || result[0] != "ax" || result[1] != "bx" {
		t.Errorf("multi OnArray = %v, want [ax bx]", result)
	}
}

func TestString(t *testing.T) {
	g := New("a*")
	s := g.String()
	if s != "Gex[a*]" {
		t.Errorf("String() = %q, want %q", s, "Gex[a*]")
	}
}

func TestEmptyPattern(t *testing.T) {
	g := New("")
	if _, ok := g.On("a"); ok {
		t.Error("empty pattern should not match 'a'")
	}
	if _, ok := g.On(""); !ok {
		t.Error("empty pattern should match ''")
	}
}
