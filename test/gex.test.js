/* Copyright (c) 2013-2022 Richard Rodger, MIT License */

const { describe, test } = require('node:test')
const assert = require('node:assert')

const GexRoot = require('..')
const { Gex } = require('..')

function s(obj) {
  return JSON.stringify(obj)
}

describe('Gex', function () {
  test('happy', () => {
    var ab = Gex('ab')
    assert.equal(ab.on('ab'), 'ab')
    assert.equal(ab.on('a'), null)
    assert.equal(ab.on('b'), null)
    assert.equal(ab.on('ba'), null)
    assert.equal(ab.on('abc'), null)
    assert.equal(ab.on('cab'), null)
    assert.equal(ab.on('cabc'), null)

    var a_b = Gex('a*b')
    assert.equal(a_b.on('acb'), 'acb')
    assert.equal(a_b.on('adb'), 'adb')
    assert.equal(a_b.on('aab'), 'aab')
    assert.equal(a_b.on('abb'), 'abb')

    assert.equal(a_b.on('aaa'), null)
    assert.equal(a_b.on('bbb'), null)
    assert.equal(a_b.on('bca'), null)
    assert.equal(a_b.on('ba'), null)
    assert.equal(a_b.on('ac'), null)
    assert.equal(a_b.on('a'), null)

    var a$b = Gex('a?b')
    assert.equal(a$b.on('acb'), 'acb')
    assert.equal(a$b.on('adb'), 'adb')
    assert.equal(a$b.on('aab'), 'aab')
    assert.equal(a$b.on('abb'), 'abb')

    assert.equal(a$b.on('aaa'), null)
    assert.equal(a$b.on('bbb'), null)
    assert.equal(a$b.on('bca'), null)
    assert.equal(a$b.on('ba'), null)
    assert.equal(a$b.on('ac'), null)
    assert.equal(a$b.on('a'), null)

    assert.equal(a_b.on('accb'), 'accb')
    assert.equal(a_b.on('acccb'), 'acccb')
    assert.equal(a_b.on('aaab'), 'aaab')
    assert.equal(a_b.on('aabb'), 'aabb')
    assert.equal(a_b.on('abbb'), 'abbb')
  })

  test('module-root', () => {
    var ab = GexRoot('ab')
    assert.equal(ab.on('ab'), 'ab')
  })

  test('arrays', () => {
    var a_ = Gex('a*')
    assert.equal(s(a_.on(['ab', 'ac'])), s(['ab', 'ac']))
    assert.equal(s(a_.on(['ab', 'dd', 'ac'])), s(['ab', 'ac']))
    assert.equal(s(a_.on(['ab', 'dd', 'ee'])), s(['ab']))
    assert.equal(s(a_.on(['ff', 'dd', 'ee'])), s([]))
    assert.equal(s(a_.on([])), s([]))
    assert.equal(s(a_.on([null])), s([]))
    assert.equal(s(a_.on(['ab', null, 'dd', undefined, 'ee', NaN])),
      s(['ab']))
  })

  test('objects', () => {
    var foo_ = Gex('foo*')
    assert.equal(s(foo_.on({ foo: 1 })), s({ foo: 1 }))
    assert.equal(s(foo_.on({ foo: 1, doo: 2 })), s({ foo: 1 }))
    assert.equal(s(foo_.on({ foo: 1, doo: 2, food: 3 })),
      s({ foo: 1, food: 3 }))

    var o0 = { food: 3 }
    var o1 = Object.create(o0)
    o1.foo = 1
    o1.doo = 2
    assert.equal(s(foo_.on(o1)), s({ foo: 1 }))
  })

  test('object without prototype', () => {
    var obj = Object.create(null)
    obj.foo = 'bar'
    assert.equal(s({ foo: 'bar' }), s(Gex('foo').on(obj)))
  })

  test('dodgy', () => {
    assert.equal(Gex().on('aaa'), null)
    assert.equal(Gex(null).on('aaa'), null)
    assert.equal(Gex(NaN).on('aaa'), null)
    assert.equal(Gex(undefined).on('aaa'), null)

    var g = Gex('g')
    assert.equal(g.on(), null)
    assert.equal(g.on(null), null)
    assert.equal(g.on(NaN), null)
    assert.equal(g.on(undefined), null)

    assert.equal(g.on(true), null)
    assert.equal(g.on(false), null)
    assert.equal(g.on(new Date()), null)
    assert.equal(g.on(/x/), null)

    assert.equal(g.on(''), null)
  })

  test('escapes', () => {
    var g = Gex('a**b')
    assert.equal(g.toString(), 'Gex[a**b]')
    assert.equal(g.re().toString(), '/^a\\*b$/')
    assert.equal(g.on('a*b'), 'a*b')
    assert.equal(g.on('a**b'), null) // not a literal 'a*b'

    g = Gex('a*?b')
    assert.equal(g.toString(), 'Gex[a*?b]')
    assert.equal(g.re().toString(), '/^a\\?b$/')
    assert.equal(g.on('a?b'), 'a?b')
    assert.equal(g.on('a*?b'), null) // not a literal 'a?b'

    assert.equal(g.esc(''), '')
    assert.equal(g.esc('*'), '**')
    assert.equal(g.esc('?'), '*?')
    assert.equal(g.esc('a*'), 'a**')
    assert.equal(g.esc('a?'), 'a*?')
    assert.equal(g.esc('a*b*c'), 'a**b**c')
    assert.equal(g.esc('a?b?c'), 'a*?b*?c')
  })

  test('newlines', () => {
    var g = Gex('a*b')
    assert.equal('/^a[\\s\\S]*b$/', '' + g.re())
    assert.equal(g.on('a\nb'), 'a\nb')
  })

  test('zero', () => {
    assert.equal(Gex('0').on('0'), '0')
    assert.equal(Gex('0*').on('0'), '0')
    assert.equal(Gex('*0').on('0'), '0')
    assert.equal(Gex('*0*').on('0'), '0')

    assert.equal(Gex(['0']).on('0'), '0')
    assert.equal(Gex(['0*']).on('0'), '0')
    assert.equal(Gex(['*0']).on('0'), '0')
    assert.equal(Gex(['*0*']).on('0'), '0')

    assert.equal(Gex(1).on('1'), '1')
    assert.equal(Gex(100).on('100'), '100')
    assert.equal(Gex(0).on('0'), '0')
  })

  test('multi', () => {
    var g = Gex(['a', 'b'])
    assert.equal(g.on('a'), 'a')
    assert.equal(g.on('b'), 'b')
    assert.equal(s(g.re()), '{"a":{},"b":{}}')

    g = Gex(['a*', 'b'])
    assert.equal(g.on('ax'), 'ax')
    assert.equal(g.on('b'), 'b')
    assert.equal(s(g.re()), '{"a*":{},"b":{}}')

    assert.equal(Gex(['a*', 'b*']).on('bx'), 'bx')
    assert.equal(Gex(['a*', 'b*']).on(['ax', 'zz', 'bx']).toString(), 'ax,bx')
  })

  test('inspect', () => {
    var g = Gex('a*')
    assert.equal(g.toString(), 'Gex[a*]')
    assert.equal(g.inspect(), 'Gex[a*]')

    g = Gex(['a*', '*b'])
    assert.equal(g.inspect(), 'Gex[a*,*b]')
  })

  test('funky', () => {
    assert.equal(Gex('').on('a'), null)
    assert.equal(Gex().on('a'), null)
    assert.equal(Gex(null).on('a'), null)
    assert.equal(Gex(undefined).on('a'), null)
    assert.equal(Gex(NaN).on('a'), null)
    assert.equal(Gex(/a/).on('a'), null)
  })
})
