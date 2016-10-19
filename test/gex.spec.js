/* Copyright (c) 2013-2015 Richard Rodger, MIT License */
"use strict";


if( typeof gex === 'undefined' ) {
  var gex = require('..')
}



function s(obj){
  return JSON.stringify(obj)
}



describe('gex', function() {
  it('happy', function() {
    var ab = gex('ab')
    expect( 'ab' ).toBe(  ab.on('ab') )
    expect( null ).toBe(  ab.on('a') )
    expect( null ).toBe(  ab.on('b') )
    expect( null ).toBe(  ab.on('ba') )
    expect( null ).toBe(  ab.on('abc') )
    expect( null ).toBe(  ab.on('cab') )
    expect( null ).toBe(  ab.on('cabc') )

    var a_b = gex('a*b')
    expect( 'acb' ).toBe(  a_b.on('acb') )
    expect( 'adb' ).toBe(  a_b.on('adb') )
    expect( 'aab' ).toBe(  a_b.on('aab') )
    expect( 'abb' ).toBe(  a_b.on('abb') )

    expect( null ).toBe(  a_b.on('aaa') )
    expect( null ).toBe(  a_b.on('bbb') )
    expect( null ).toBe(  a_b.on('bca') )
    expect( null ).toBe(  a_b.on('ba') )
    expect( null ).toBe(   a_b.on('ac') )
    expect( null ).toBe(   a_b.on('a') )

    var a$b = gex('a?b')
    expect( 'acb' ).toBe(  a$b.on('acb') )
    expect( 'adb' ).toBe(  a$b.on('adb') )
    expect( 'aab' ).toBe(  a$b.on('aab') )
    expect( 'abb' ).toBe(  a$b.on('abb') )

    expect( null ).toBe(  a$b.on('aaa') )
    expect( null ).toBe(  a$b.on('bbb') )
    expect( null ).toBe(  a$b.on('bca') )
    expect( null ).toBe(  a$b.on('ba') )
    expect( null ).toBe(   a$b.on('ac') )
    expect( null ).toBe(   a$b.on('a') )


    expect( 'accb' ).toBe(  a_b.on('accb') )
    expect( 'acccb' ).toBe(  a_b.on('acccb') )
    expect( 'aaab' ).toBe(  a_b.on('aaab') )
    expect( 'aabb' ).toBe(  a_b.on('aabb') )
    expect( 'abbb' ).toBe(  a_b.on('abbb') )

  })


  it('arrays', function() {
    var a_ = gex('a*')
    expect( s(['ab','ac'])).toBe(s(a_.on(['ab','ac'])) )
    expect( s(['ab','ac'])).toBe(s(a_.on(['ab','dd','ac'])) )
    expect( s(['ab']) ).toBe( s(a_.on(['ab','dd','ee'])) )
    expect( s([]) ).toBe(  s(a_.on(['ff','dd','ee'])) )
    expect( s([]) ).toBe(  s(a_.on([])) )
  })


  it('objects', function() {
    var foo_ = gex('foo*')
    expect( s({foo:1}) ).toBe(  s(foo_.on({foo:1})) )
    expect( s({foo:1}) ).toBe(  s(foo_.on({foo:1,doo:2})) )
    expect( s({foo:1,food:3}) ).toBe( s(foo_.on({foo:1,doo:2,food:3})) )
  })

  it('object without prototype', function() {
    var obj = Object.create(null)
    obj.foo = 'bar'
    expect(s({foo: 'bar'})).toBe( s(gex('foo').on(obj)) )
  })

  it('dodgy', function() {
    expect( null ).toBe(  gex().on('aaa') )
    expect( null ).toBe(  gex(null).on('aaa') )
    expect( null ).toBe(  gex(NaN).on('aaa') )
    expect( null ).toBe(  gex(undefined).on('aaa') )

    var g = gex('g')
    expect( null ).toBe(  g.on() )
    expect( null ).toBe(  g.on(null) )
    expect( null ).toBe(  g.on(NaN) )
    expect( null ).toBe(  g.on(undefined) )

    expect( s([]) ).toBe(  s(g.on([])) )
    expect( s([]) ).toBe(  s(g.on([null])) )
    expect( s([]) ).toBe(  s(g.on([NaN])) )
    expect( s([]) ).toBe(  s(g.on([undefined])) )
  })


  it('escapes', function() {
    var g = gex('a**b')
    expect( 'gex[a**b]' ).toBe( g+'')
    expect( '/^a\\*b$/' ).toBe( ''+g.re())
    expect( 'a*b' ).toBe(  g.on('a*b') ) 
    expect( null ).toBe(  g.on('a**b') ) 

    g = gex('a*?b')
    expect( 'gex[a*?b]' ).toBe( g+'')
    expect( '/^a\\?b$/' ).toBe( ''+g.re())
    expect( 'a?b' ).toBe(  g.on('a?b') ) 
    expect( null ).toBe(  g.on('a*?b') ) 

    expect( g.esc('') ).toBe( '' )
    expect( g.esc('*') ).toBe( '**' )
    expect( g.esc('?') ).toBe( '*?' )
    
  })


  it('newlines', function() {
    var g = gex('a*b')
    expect( '/^a[\\s\\S]*b$/',''+g.re())

    expect( 'a\nb' ).toBe( g.on('a\nb') ) 
  })


  it('zero', function() {
    expect( '0' ).toBe( gex('0').on('0') )
    expect( '0' ).toBe( gex('0*').on('0') )
    expect( '0' ).toBe( gex('*0').on('0') )
    expect( '0' ).toBe( gex('*0*').on('0') )

    expect( '0' ).toBe( gex(['0']).on('0') )
    expect( '0' ).toBe( gex(['0*']).on('0') )
    expect( '0' ).toBe( gex(['*0']).on('0') )
    expect( '0' ).toBe( gex(['*0*']).on('0') )

    expect( '1' ).toBe( gex(1).on('1') )
    expect( '100' ).toBe( gex(100).on('100') )
    expect( '0' ).toBe( gex(0).on('0') )
  })


  it('noConflict', function() {
    var g = gex('a').noConflict()
    expect( 'a' ).toBe( g.on('a') ) 
  })


  it('multi', function() {
    var g = gex(['a','b'])
    expect( 'a' ).toBe( g.on('a'))
    expect( 'b' ).toBe( g.on('b'))
    expect( '{"a":{},"b":{}}' ).toBe( JSON.stringify(g.re()))

    g = gex(['a*','b'])
    expect( 'ax' ).toBe( g.on('ax'))
    expect( 'b' ).toBe( g.on('b'))
    expect( '{"a*":{},"b":{}}' ).toBe( JSON.stringify(g.re()))

    expect( 'bx' ).toBe(  ''+gex(['a*','b*']).on( 'bx' ) )
    expect( 'ax ).toBe( bx', ''+gex(['a*','b*']).on( ['ax','zz','bx'] ) )
  })


  it('inspect', function(){
    var g = gex('a*')
    expect( g.inspect() ).toBe( 'gex[a*]') 

    g = gex(['a*','*b'])
    expect( g.inspect() ).toBe( 'gex[a*,*b]') 
  })
})

