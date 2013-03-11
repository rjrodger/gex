/* Copyright (c) 2011-2013 Richard Rodger, MIT License */
"use strict";


// mocha gex.test.js


var assert = require('assert')
var util   = require('util')


var gex = require('..') 


function s(obj){
  return JSON.stringify(obj)
}



describe('gex', function() {
  it('happy', function() {
    var ab = gex('ab')
    assert.equal( 'ab', ab.on('ab') )
    assert.equal( null, ab.on('a') )
    assert.equal( null, ab.on('b') )
    assert.equal( null, ab.on('ba') )
    assert.equal( null, ab.on('abc') )
    assert.equal( null, ab.on('cab') )
    assert.equal( null, ab.on('cabc') )

    var a_b = gex('a*b')
    assert.equal( 'acb', a_b.on('acb') )
    assert.equal( 'adb', a_b.on('adb') )
    assert.equal( 'aab', a_b.on('aab') )
    assert.equal( 'abb', a_b.on('abb') )

    assert.equal( null, a_b.on('aaa') )
    assert.equal( null, a_b.on('bbb') )
    assert.equal( null, a_b.on('bca') )
    assert.equal( null, a_b.on('ba') )
    assert.equal( null,  a_b.on('ac') )
    assert.equal( null,  a_b.on('a') )

    var a$b = gex('a?b')
    assert.equal( 'acb', a$b.on('acb') )
    assert.equal( 'adb', a$b.on('adb') )
    assert.equal( 'aab', a$b.on('aab') )
    assert.equal( 'abb', a$b.on('abb') )

    assert.equal( null, a$b.on('aaa') )
    assert.equal( null, a$b.on('bbb') )
    assert.equal( null, a$b.on('bca') )
    assert.equal( null, a$b.on('ba') )
    assert.equal( null,  a$b.on('ac') )
    assert.equal( null,  a$b.on('a') )


    assert.equal( 'accb', a_b.on('accb') )
    assert.equal( 'acccb', a_b.on('acccb') )
    assert.equal( 'aaab', a_b.on('aaab') )
    assert.equal( 'aabb', a_b.on('aabb') )
    assert.equal( 'abbb', a_b.on('abbb') )

  })


  it('arrays', function() {
    var a_ = gex('a*')
    assert.equal( s(['ab','ac']), s(a_.on(['ab','ac'])) )
    assert.equal( s(['ab','ac']), s(a_.on(['ab','dd','ac'])) )
    assert.equal( s(['ab']), s(a_.on(['ab','dd','ee'])) )
    assert.equal( s([]), s(a_.on(['ff','dd','ee'])) )
    assert.equal( s([]), s(a_.on([])) )
  })


  it('objects', function() {
    var foo_ = gex('foo*')
    assert.equal( s({foo:1}), s(foo_.on({foo:1})) )
    assert.equal( s({foo:1}), s(foo_.on({foo:1,doo:2})) )
    assert.equal( s({foo:1,food:3}), s(foo_.on({foo:1,doo:2,food:3})) )
  })


  it('dodgy', function() {
    assert.equal( null, gex().on('aaa') )
    assert.equal( null, gex(null).on('aaa') )
    assert.equal( null, gex(NaN).on('aaa') )
    assert.equal( null, gex(undefined).on('aaa') )

    var g = gex('g')
    assert.equal( null, g.on() )
    assert.equal( null, g.on(null) )
    assert.equal( null, g.on(NaN) )
    assert.equal( null, g.on(undefined) )

    assert.equal( s([]), s(g.on([])) )
    assert.equal( s([]), s(g.on([null])) )
    assert.equal( s([]), s(g.on([NaN])) )
    assert.equal( s([]), s(g.on([undefined])) )
  })


  it('escapes', function() {
    var g = gex('a**b')
    assert.equal('a**b',g+'')
    assert.equal('/^a\\*b$/',''+g.re())
    assert.equal( 'a*b', g.on('a*b') ) 
    assert.equal( null, g.on('a**b') ) 

    g = gex('a*?b')
    assert.equal('a*?b',g+'')
    assert.equal('/^a\\?b$/',''+g.re())
    assert.equal( 'a?b', g.on('a?b') ) 
    assert.equal( null, g.on('a*?b') ) 
  })


  it('newlines', function() {
    var g = gex('a*b')
    assert.equal('/^a[\\s\\S]*b$/',''+g.re())

    assert.equal( 'a\nb', g.on('a\nb') ) 
  })


  it('multi', function() {
    var g = gex(['a','b'])
    assert.equal('a',g.on('a'))
    assert.equal('b',g.on('b'))
    assert.equal('{ a: /^a$/, b: /^b$/ }',util.inspect(g.re()))

    g = gex(['a*','b'])
    assert.equal('ax',g.on('ax'))
    assert.equal('b',g.on('b'))
    assert.equal("{ 'a*': /^a[\\s\\S]*$/, b: /^b$/ }",util.inspect(g.re()))

    assert.equal( 'bx', ''+gex(['a*','b*']).on( 'bx' ) )
    assert.equal( 'ax,bx', ''+gex(['a*','b*']).on( ['ax','zz','bx'] ) )
  })
})
