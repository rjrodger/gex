/* Copyright (c) 2013-2020 Richard Rodger, MIT License */
'use strict'

var Lab = require('@hapi/lab')
Lab = null != Lab.script ? Lab : require('./hapi-lab-shim')

var Code = require('@hapi/code')

var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect
var gex = require('..')

function s(obj) {
  return JSON.stringify(obj)
}

describe('gex', function () {
  it('happy', () => {
    var ab = gex('ab')
    expect(ab.on('ab')).equal('ab')
    expect(ab.on('a')).equal(null)
    expect(ab.on('b')).equal(null)
    expect(ab.on('ba')).equal(null)
    expect(ab.on('abc')).equal(null)
    expect(ab.on('cab')).equal(null)
    expect(ab.on('cabc')).equal(null)

    var a_b = gex('a*b')
    expect(a_b.on('acb')).equal('acb')
    expect(a_b.on('adb')).equal('adb')
    expect(a_b.on('aab')).equal('aab')
    expect(a_b.on('abb')).equal('abb')

    expect(a_b.on('aaa')).equal(null)
    expect(a_b.on('bbb')).equal(null)
    expect(a_b.on('bca')).equal(null)
    expect(a_b.on('ba')).equal(null)
    expect(a_b.on('ac')).equal(null)
    expect(a_b.on('a')).equal(null)

    var a$b = gex('a?b')
    expect(a$b.on('acb')).equal('acb')
    expect(a$b.on('adb')).equal('adb')
    expect(a$b.on('aab')).equal('aab')
    expect(a$b.on('abb')).equal('abb')

    expect(a$b.on('aaa')).equal(null)
    expect(a$b.on('bbb')).equal(null)
    expect(a$b.on('bca')).equal(null)
    expect(a$b.on('ba')).equal(null)
    expect(a$b.on('ac')).equal(null)
    expect(a$b.on('a')).equal(null)

    expect(a_b.on('accb')).equal('accb')
    expect(a_b.on('acccb')).equal('acccb')
    expect(a_b.on('aaab')).equal('aaab')
    expect(a_b.on('aabb')).equal('aabb')
    expect(a_b.on('abbb')).equal('abbb')
  })

  it('arrays', () => {
    var a_ = gex('a*') // maybe: to deep equal
    expect(s(a_.on(['ab', 'ac']))).equal(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ac']))).equal(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ee']))).equal(s(['ab']))
    expect(s(a_.on(['ff', 'dd', 'ee']))).equal(s([]))
    expect(s(a_.on([]))).equal(s([]))
    expect(s(a_.on([null]))).equal(s([]))
    expect(s(a_.on(['ab', null, 'dd', undefined, 'ee', NaN]))).equal(s(['ab']))
  })

  it('objects', () => {
    var foo_ = gex('foo*')
    expect(s(foo_.on({ foo: 1 }))).equal(s({ foo: 1 }))
    expect(s(foo_.on({ foo: 1, doo: 2 }))).equal(
      s({ foo: 1 })
    )
    expect(s(foo_.on({ foo: 1, doo: 2, food: 3 }))).equal(
      s({ foo: 1, food: 3 })
    )

    var o0 = { food: 3 }
    var o1 = Object.create(o0)
    o1.foo = 1
    o1.doo = 2
    expect(s(foo_.on(o1))).equal(s({foo:1}))
  })

  it('object without prototype', () => {
    var obj = Object.create(null)
    obj.foo = 'bar'
    expect(s({ foo: 'bar' })).equal(s(gex('foo').on(obj)))
  })

  it('dodgy', () => {
    expect(gex().on('aaa')).equal(null)
    expect(gex(null).on('aaa')).equal(null)
    expect(gex(NaN).on('aaa')).equal(null)
    expect(gex(undefined).on('aaa')).equal(null)

    var g = gex('g')
    expect(g.on()).equal(null)
    expect(g.on(null)).equal(null)
    expect(g.on(NaN)).equal(null)
    expect(g.on(undefined)).equal(null)

    expect(g.on(true)).equal(null)
    expect(g.on(false)).equal(null)
    expect(g.on(new Date())).equal(null)
    expect(g.on(/x/)).equal(null)
  })

  it('escapes', () => {
    var g = gex('a**b')
    expect(g.toString()).equal('gex[a**b]')
    expect(g.re().toString()).equal('/^a\\*b$/')
    expect(g.on('a*b')).equal('a*b')
    expect(g.on('a**b')).equal(null) // not a literal 'a*b'

    g = gex('a*?b')
    expect(g.toString()).equal('gex[a*?b]')
    expect(g.re().toString()).equal('/^a\\?b$/')
    expect(g.on('a?b')).equal('a?b')
    expect(g.on('a*?b')).equal(null) // not a literal 'a?b'

    expect(g.esc('')).equal('')
    expect(g.esc('*')).equal('**')
    expect(g.esc('?')).equal('*?')
    expect(g.esc('a*')).equal('a**')
    expect(g.esc('a?')).equal('a*?')
    expect(g.esc('a*b*c')).equal('a**b**c')
    expect(g.esc('a?b?c')).equal('a*?b*?c')
  })

  it('newlines', () => {
    var g = gex('a*b')
    expect('/^a[\\s\\S]*b$/').equal('' + g.re())
    expect(g.on('a\nb')).equal('a\nb')
  })

  it('zero', () => {
    expect(gex('0').on('0')).equal('0')
    expect(gex('0*').on('0')).equal('0')
    expect(gex('*0').on('0')).equal('0')
    expect(gex('*0*').on('0')).equal('0')

    expect(gex(['0']).on('0')).equal('0')
    expect(gex(['0*']).on('0')).equal('0')
    expect(gex(['*0']).on('0')).equal('0')
    expect(gex(['*0*']).on('0')).equal('0')

    expect(gex(1).on('1')).equal('1')
    expect(gex(100).on('100')).equal('100')
    expect(gex(0).on('0')).equal('0')
  })

  it('multi', () => {
    var g = gex(['a', 'b'])
    expect(g.on('a')).equal('a')
    expect(g.on('b')).equal('b')
    expect(s(g.re())).equal('{"a":{},"b":{}}')

    g = gex(['a*', 'b'])
    expect(g.on('ax')).equal('ax')
    expect(g.on('b')).equal('b')
    expect(s(g.re())).equal('{"a*":{},"b":{}}')

    expect(gex(['a*', 'b*']).on('bx')).equal(
      'bx'
    )
    expect(gex(['a*', 'b*']).on(['ax', 'zz', 'bx']).toString()).equal(
      'ax,bx'
    )
  })

  it('inspect', () => {
    var g = gex('a*')
    expect(g.toString()).equal('gex[a*]')
    expect(g.inspect()).equal('gex[a*]')

    g = gex(['a*', '*b'])
    expect(g.inspect()).equal('gex[a*,*b]')
  })
})
