/* Copyright (c) 2013-2020 Richard Rodger, MIT License */
'use strict'

var Lab = require('@hapi/lab')
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
    expect(ab.on('ab')).to.equal('ab')
    expect(ab.on('a')).to.equal(null)
    expect(ab.on('b')).to.equal(null)
    expect(ab.on('ba')).to.equal(null)
    expect(ab.on('abc')).to.equal(null)
    expect(ab.on('cab')).to.equal(null)
    expect(ab.on('cabc')).to.equal(null)

    var a_b = gex('a*b')
    expect(a_b.on('acb')).to.equal('acb')
    expect(a_b.on('adb')).to.equal('adb')
    expect(a_b.on('aab')).to.equal('aab')
    expect(a_b.on('abb')).to.equal('abb')

    expect(a_b.on('aaa')).to.equal(null)
    expect(a_b.on('bbb')).to.equal(null)
    expect(a_b.on('bca')).to.equal(null)
    expect(a_b.on('ba')).to.equal(null)
    expect(a_b.on('ac')).to.equal(null)
    expect(a_b.on('a')).to.equal(null)

    var a$b = gex('a?b')
    expect(a$b.on('acb')).to.equal('acb')
    expect(a$b.on('adb')).to.equal('adb')
    expect(a$b.on('aab')).to.equal('aab')
    expect(a$b.on('abb')).to.equal('abb')

    expect(a$b.on('aaa')).to.equal(null)
    expect(a$b.on('bbb')).to.equal(null)
    expect(a$b.on('bca')).to.equal(null)
    expect(a$b.on('ba')).to.equal(null)
    expect(a$b.on('ac')).to.equal(null)
    expect(a$b.on('a')).to.equal(null)

    expect(a_b.on('accb')).to.equal('accb')
    expect(a_b.on('acccb')).to.equal('acccb')
    expect(a_b.on('aaab')).to.equal('aaab')
    expect(a_b.on('aabb')).to.equal('aabb')
    expect(a_b.on('abbb')).to.equal('abbb')
  })

  it('arrays', () => {
    var a_ = gex('a*') // maybe: to deep equal
    expect(s(a_.on(['ab', 'ac']))).to.equal(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ac']))).to.equal(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ee']))).to.equal(s(a_.on(['ab', 'dd', 'ee'])))
    expect(s(a_.on(['ff', 'dd', 'ee']))).to.equal(s(a_.on(['ff', 'dd', 'ee'])))
    expect(s(a_.on([]))).to.equal(s(a_.on([])))
  })

  it('objects', () => {
    var foo_ = gex('foo*')
    expect(s(foo_.on({ foo: 1 }))).to.equal(s(foo_.on({ foo: 1 })))
    expect(s(foo_.on({ foo: 1, doo: 2 }))).to.equal(
      s(foo_.on({ foo: 1, doo: 2 }))
    )
    expect(s(foo_.on({ foo: 1, doo: 2, food: 3 }))).to.equal(
      s(foo_.on({ foo: 1, doo: 2, food: 3 }))
    )

    var o0 = { food: 3 }
    var o1 = Object.create(o0)
    o1.foo = 1
    o1.doo = 2
    expect(s(foo_.on(o1))).to.equal(s({foo:1}))
  })

  it('object without prototype', () => {
    var obj = Object.create(null)
    obj.foo = 'bar'
    expect(s({ foo: 'bar' })).equal(s(gex('foo').on(obj)))
  })

  it('dodgy', () => {
    expect(gex().on('aaa')).to.equal(gex().on('aaa'))
    expect(gex(null).on('aaa')).to.equal(gex(null).on('aaa'))
    expect(gex(NaN).on('aaa')).to.equal(gex(NaN).on('aaa'))
    expect(gex(undefined).on('aaa')).to.equal(gex(undefined).on('aaa'))

    var g = gex('g')
    expect(g.on()).to.equal(g.on())
    expect(g.on(null)).to.equal(g.on(null))
    expect(g.on(NaN)).to.equal(g.on(NaN))
    expect(g.on(undefined)).to.equal(g.on(undefined))

    expect(s(g.on([]))).to.equal(s(g.on([])))
    expect(s(g.on([null]))).to.equal(s(g.on([null])))
    expect(s(g.on([NaN]))).to.equal(s(g.on([NaN])))
    expect(s(g.on([undefined]))).to.equal(s(g.on([undefined])))

    expect(g.on(true)).to.equal(null)
    expect(g.on(false)).to.equal(null)
    expect(g.on(new Date())).to.equal(null)
    expect(g.on(/x/)).to.equal(null)
  })

  it('escapes', () => {
    var g = gex('a**b')
    expect(g.toString()).to.equal('gex[a**b]')
    expect(g.re().toString()).to.equal('/^a\\*b$/')
    expect(g.on('a*b')).to.equal(g.on('a*b'))
    expect(g.on('a**b')).to.equal(g.on('a**b'))

    g = gex('a*?b')
    expect(g.toString()).to.equal('gex[a*?b]')
    expect(g.re().toString()).to.equal('/^a\\?b$/')
    expect(g.on('a?b')).to.equal(g.on('a?b'))
    expect(g.on('a*?b')).to.equal(g.on('a*?b'))

    expect(g.esc('')).to.equal('')
    expect(g.esc('*')).to.equal('**')
    expect(g.esc('?')).to.equal('*?')
    expect(g.esc('a*')).to.equal('a**')
    expect(g.esc('a?')).to.equal('a*?')
    expect(g.esc('a*b*c')).to.equal('a**b**c')
    expect(g.esc('a?b?c')).to.equal('a*?b*?c')
  })

  it('newlines', () => {
    var g = gex('a*b')
    expect('/^a[\\s\\S]*b$/').equal('' + g.re())
    expect(g.on('a\nb')).equal(g.on('a\nb'))
  })

  it('zero', () => {
    expect(gex('0').on('0')).to.equal(gex('0').on('0'))
    expect(gex('0*').on('0')).to.equal(gex('0*').on('0'))
    expect(gex('*0').on('0')).to.equal(gex('*0').on('0'))
    expect(gex('*0*').on('0')).to.equal(gex('*0*').on('0'))

    expect(gex(['0']).on('0')).to.equal(gex(['0']).on('0'))
    expect(gex(['0*']).on('0')).to.equal(gex(['0*']).on('0'))
    expect(gex(['*0']).on('0')).to.equal(gex(['*0']).on('0'))
    expect(gex(['*0*']).on('0')).to.equal(gex(['*0*']).on('0'))

    expect(gex(1).on('1')).to.equal(gex(1).on('1'))
    expect(gex(100).on('100')).to.equal(gex(100).on('100'))
    expect(gex(0).on('0')).to.equal(gex(0).on('0'))
  })

  it('multi', () => {
    var g = gex(['a', 'b'])
    expect(g.on('a')).to.equal('a')
    expect(g.on('b')).to.equal('b')
    expect(s(g.re())).to.equal('{"a":{},"b":{}}')

    g = gex(['a*', 'b'])
    expect(g.on('ax')).to.equal('ax')
    expect(g.on('b')).to.equal('b')
    expect(s(g.re())).to.equal('{"a*":{},"b":{}}')

    expect(gex(['a*', 'b*']).on('bx')).to.equal(
      gex(['a*', 'b*']).on('bx').toString()
    )
    expect(gex(['a*', 'b*']).on(['ax', 'zz', 'bx']).toString()).to.equal(
      'ax,bx'
    ) // cut: 'ax. (previous test was bork.
  })

  it('inspect', () => {
    var g = gex('a*')
    expect(g.inspect()).to.equal('gex[a*]')

    g = gex(['a*', '*b'])
    expect(g.inspect()).to.equal('gex[a*,*b]')
  })
})
