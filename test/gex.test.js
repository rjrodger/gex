/* Copyright (c) 2013-2022 Richard Rodger, MIT License */

const GexRoot = require('..')
const { Gex } = require('..')

function s(obj) {
  return JSON.stringify(obj)
}

describe('Gex', function () {
  test('happy', () => {
    var ab = Gex('ab')
    expect(ab.on('ab')).toEqual('ab')
    expect(ab.on('a')).toEqual(null)
    expect(ab.on('b')).toEqual(null)
    expect(ab.on('ba')).toEqual(null)
    expect(ab.on('abc')).toEqual(null)
    expect(ab.on('cab')).toEqual(null)
    expect(ab.on('cabc')).toEqual(null)

    var a_b = Gex('a*b')
    expect(a_b.on('acb')).toEqual('acb')
    expect(a_b.on('adb')).toEqual('adb')
    expect(a_b.on('aab')).toEqual('aab')
    expect(a_b.on('abb')).toEqual('abb')

    expect(a_b.on('aaa')).toEqual(null)
    expect(a_b.on('bbb')).toEqual(null)
    expect(a_b.on('bca')).toEqual(null)
    expect(a_b.on('ba')).toEqual(null)
    expect(a_b.on('ac')).toEqual(null)
    expect(a_b.on('a')).toEqual(null)

    var a$b = Gex('a?b')
    expect(a$b.on('acb')).toEqual('acb')
    expect(a$b.on('adb')).toEqual('adb')
    expect(a$b.on('aab')).toEqual('aab')
    expect(a$b.on('abb')).toEqual('abb')

    expect(a$b.on('aaa')).toEqual(null)
    expect(a$b.on('bbb')).toEqual(null)
    expect(a$b.on('bca')).toEqual(null)
    expect(a$b.on('ba')).toEqual(null)
    expect(a$b.on('ac')).toEqual(null)
    expect(a$b.on('a')).toEqual(null)

    expect(a_b.on('accb')).toEqual('accb')
    expect(a_b.on('acccb')).toEqual('acccb')
    expect(a_b.on('aaab')).toEqual('aaab')
    expect(a_b.on('aabb')).toEqual('aabb')
    expect(a_b.on('abbb')).toEqual('abbb')
  })

  test('module-root', () => {
    var ab = GexRoot('ab')
    expect(ab.on('ab')).toEqual('ab')
  })

  // test('module-default', () => {
  //   var ab = GexDefault('ab')
  //   expect(ab.on('ab')).toEqual('ab')
  // })

  test('arrays', () => {
    var a_ = Gex('a*') // maybe: to deep equal
    expect(s(a_.on(['ab', 'ac']))).toEqual(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ac']))).toEqual(s(['ab', 'ac']))
    expect(s(a_.on(['ab', 'dd', 'ee']))).toEqual(s(['ab']))
    expect(s(a_.on(['ff', 'dd', 'ee']))).toEqual(s([]))
    expect(s(a_.on([]))).toEqual(s([]))
    expect(s(a_.on([null]))).toEqual(s([]))
    expect(s(a_.on(['ab', null, 'dd', undefined, 'ee', NaN]))).toEqual(
      s(['ab'])
    )
  })

  test('objects', () => {
    var foo_ = Gex('foo*')
    expect(s(foo_.on({ foo: 1 }))).toEqual(s({ foo: 1 }))
    expect(s(foo_.on({ foo: 1, doo: 2 }))).toEqual(s({ foo: 1 }))
    expect(s(foo_.on({ foo: 1, doo: 2, food: 3 }))).toEqual(
      s({ foo: 1, food: 3 })
    )

    var o0 = { food: 3 }
    var o1 = Object.create(o0)
    o1.foo = 1
    o1.doo = 2
    expect(s(foo_.on(o1))).toEqual(s({ foo: 1 }))
  })

  test('object without prototype', () => {
    var obj = Object.create(null)
    obj.foo = 'bar'
    expect(s({ foo: 'bar' })).toEqual(s(Gex('foo').on(obj)))
  })

  test('dodgy', () => {
    expect(Gex().on('aaa')).toEqual(null)
    expect(Gex(null).on('aaa')).toEqual(null)
    expect(Gex(NaN).on('aaa')).toEqual(null)
    expect(Gex(undefined).on('aaa')).toEqual(null)

    var g = Gex('g')
    expect(g.on()).toEqual(null)
    expect(g.on(null)).toEqual(null)
    expect(g.on(NaN)).toEqual(null)
    expect(g.on(undefined)).toEqual(null)

    expect(g.on(true)).toEqual(null)
    expect(g.on(false)).toEqual(null)
    expect(g.on(new Date())).toEqual(null)
    expect(g.on(/x/)).toEqual(null)

    expect(g.on('')).toEqual(null)
  })

  test('escapes', () => {
    var g = Gex('a**b')
    expect(g.toString()).toEqual('Gex[a**b]')
    expect(g.re().toString()).toEqual('/^a\\*b$/')
    expect(g.on('a*b')).toEqual('a*b')
    expect(g.on('a**b')).toEqual(null) // not a literal 'a*b'

    g = Gex('a*?b')
    expect(g.toString()).toEqual('Gex[a*?b]')
    expect(g.re().toString()).toEqual('/^a\\?b$/')
    expect(g.on('a?b')).toEqual('a?b')
    expect(g.on('a*?b')).toEqual(null) // not a literal 'a?b'

    expect(g.esc('')).toEqual('')
    expect(g.esc('*')).toEqual('**')
    expect(g.esc('?')).toEqual('*?')
    expect(g.esc('a*')).toEqual('a**')
    expect(g.esc('a?')).toEqual('a*?')
    expect(g.esc('a*b*c')).toEqual('a**b**c')
    expect(g.esc('a?b?c')).toEqual('a*?b*?c')
  })

  test('newlines', () => {
    var g = Gex('a*b')
    expect('/^a[\\s\\S]*b$/').toEqual('' + g.re())
    expect(g.on('a\nb')).toEqual('a\nb')
  })

  test('zero', () => {
    expect(Gex('0').on('0')).toEqual('0')
    expect(Gex('0*').on('0')).toEqual('0')
    expect(Gex('*0').on('0')).toEqual('0')
    expect(Gex('*0*').on('0')).toEqual('0')

    expect(Gex(['0']).on('0')).toEqual('0')
    expect(Gex(['0*']).on('0')).toEqual('0')
    expect(Gex(['*0']).on('0')).toEqual('0')
    expect(Gex(['*0*']).on('0')).toEqual('0')

    expect(Gex(1).on('1')).toEqual('1')
    expect(Gex(100).on('100')).toEqual('100')
    expect(Gex(0).on('0')).toEqual('0')
  })

  test('multi', () => {
    var g = Gex(['a', 'b'])
    expect(g.on('a')).toEqual('a')
    expect(g.on('b')).toEqual('b')
    expect(s(g.re())).toEqual('{"a":{},"b":{}}')

    g = Gex(['a*', 'b'])
    expect(g.on('ax')).toEqual('ax')
    expect(g.on('b')).toEqual('b')
    expect(s(g.re())).toEqual('{"a*":{},"b":{}}')

    expect(Gex(['a*', 'b*']).on('bx')).toEqual('bx')
    expect(Gex(['a*', 'b*']).on(['ax', 'zz', 'bx']).toString()).toEqual('ax,bx')
  })

  test('inspect', () => {
    var g = Gex('a*')
    expect(g.toString()).toEqual('Gex[a*]')
    expect(g.inspect()).toEqual('Gex[a*]')

    g = Gex(['a*', '*b'])
    expect(g.inspect()).toEqual('Gex[a*,*b]')
  })

  test('funky', () => {
    expect(Gex('').on('a')).toEqual(null)
    expect(Gex().on('a')).toEqual(null)
    expect(Gex(null).on('a')).toEqual(null)
    expect(Gex(undefined).on('a')).toEqual(null)
    expect(Gex(NaN).on('a')).toEqual(null)
    expect(Gex(/a/).on('a')).toEqual(null)
  })
})
