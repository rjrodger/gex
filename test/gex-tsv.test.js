/* Copyright (c) 2013-2024 Richard Rodger, MIT License */

const { describe, test } = require('node:test')
const assert = require('node:assert')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const { Gex } = require('..')

function loadTSV(filename) {
  const content = readFileSync(join(__dirname, filename), 'utf8')
  const rows = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    const cols = line.split('\t')
    rows.push(cols)
  }
  return rows
}

describe('match (TSV)', () => {
  const rows = loadTSV('match.tsv').filter(r => r.length >= 3)
  for (const [pattern, input, expected] of rows) {
    const inputStr = input.replace(/\\n/g, '\n')
    const expectedStr = expected === 'null' ? null : expected.replace(/\\n/g, '\n')
    test(`Gex('${pattern}').on('${input}') === ${expected}`, () => {
      assert.strictEqual(Gex(pattern).on(inputStr), expectedStr)
    })
  }
})

describe('escape (TSV)', () => {
  const rows = loadTSV('escape.tsv')
  const g = Gex('*')
  for (const [input, expected] of rows) {
    test(`esc('${input}') === '${expected}'`, () => {
      assert.strictEqual(g.esc(input), expected)
    })
  }
})

describe('re (TSV)', () => {
  const rows = loadTSV('re.tsv')
  for (const [pattern, expectedRe] of rows) {
    test(`Gex('${pattern}').re() === ${expectedRe}`, () => {
      assert.strictEqual(Gex(pattern).re().toString(), expectedRe)
    })
  }
})
