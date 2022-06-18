(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).Gex=e()}}((function(){var e={exports:{}};Object.defineProperty(e.exports,"__esModule",{value:!0}),e.exports.Gex=void 0;class t{constructor(e){this.desc="",this.gexmap={},null!=e&&(Array.isArray(e)?e:[e]).forEach(e=>{this.gexmap[e]=this.re(this.clean(e))})}dodgy(e){return null==e||Number.isNaN(e)}clean(e){let t=""+e;return this.dodgy(e)?"":t}match(e){e=""+e;let t=!1,r=Object.keys(this.gexmap);for(let s=0;s<r.length&&!t;s++)t=!!this.gexmap[r[s]].exec(e);return t}on(e){if(null==e)return null;let t=typeof e;if("string"===t||"number"===t||"boolean"===t||e instanceof Date||e instanceof RegExp)return this.match(e)?e:null;if(Array.isArray(e)){let t=[];for(let r=0;r<e.length;r++)!this.dodgy(e[r])&&this.match(e[r])&&t.push(e[r]);return t}{let t={};for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&this.match(r)&&(t[r]=e[r]);return t}}esc(e){let t=this.clean(e);return(t=t.replace(/\*/g,"**")).replace(/\?/g,"*?")}escregexp(e){return e?(""+e).replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):""}re(e){if(""===e||e)return e="^"+(e=(e=(e=(e=(e=this.escregexp(e)).replace(/\\\*/g,"[\\s\\S]*")).replace(/\\\?/g,"[\\s\\S]")).replace(/\[\\s\\S\]\*\[\\s\\S\]\*/g,"\\*")).replace(/\[\\s\\S\]\*\[\\s\\S\]/g,"\\?"))+"$",new RegExp(e);{let e=Object.keys(this.gexmap);return 1==e.length?this.gexmap[e[0]]:{...this.gexmap}}}toString(){let e=this.desc;return""!=e?e:this.desc="Gex["+Object.keys(this.gexmap)+"]"}inspect(){return this.toString()}}function r(e){return new t(e)}return e.exports.Gex=r,e.exports=r,e.exports.Gex=r,e.exports.default=r,e=e.exports}));
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
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
    expect(s(a_.on(['ab', null, 'dd', undefined, 'ee', NaN]))).toEqual(s(['ab']))
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

},{"..":1}],3:[function(require,module,exports){
require('./gex.test.js')

},{"./gex.test.js":2}],4:[function(require,module,exports){
// Run: npm run test-web

// A quick and dirty abomination to partially run the unit tests inside an
// actual browser by simulating some of the Jest API.

const Jester = window.Jester = {
  exclude: [],
  state: {
    describe: {},
    unit: {},
    fail: {},
  }
}

// Ensure keys are sorted when JSONified.
function stringify(o) {
  if(null === o) return 'null'
  if('symbol' === typeof o) return String(o)
  if('object' !== typeof o) return ''+o
  return JSON.stringify(
    Object.keys(o)
      .sort()
      .reduce((a,k)=>(a[k]=o[k],a),{}),
    stringify) // Recusively!
}

function print(s) {
  let test = document.getElementById('test')
  test.innerHTML = test.innerHTML + s + '<br>'
}


window.describe = function(name, tests) {
  Jester.state.describe = { name }
  tests()
}
window.test = function(name, unit) {
  if(Jester.exclude.includes(name)) return;

  try {
    Jester.state.unit = { name }
    unit()
    // console.log('PASS:', name)
    print('PASS: '+name)
  }
  catch(e) {
    console.log(e)
    print('FAIL: '+name)
    print(e.message+'<br><pre>'+e.stack+'</pre>')
  }
}
window.expect = function(sval) {

  function pass(cval,ok) {
    // console.log('pass',cval,ok)
    if(!ok) {
      let state = Jester.state
      state.fail.found = sval
      state.fail.expected = cval
      let err =  new Error('FAIL: '+state.describe.name+' '+state.unit.name)
      throw err
    }
  }

  function passEqualJSON(cval) {
    let sjson = stringify(sval)
    let cjson = stringify(cval)

    let ok = sjson === cjson
    pass(cval, ok)
  }

  return {
    toEqual: (cval)=>{
      passEqualJSON(cval)
    },
    toBeTruthy: (cval)=>pass(cval,!!cval),
    toBeFalsy: (cval)=>pass(cval,!cval),
    toBeDefined: (cval)=>pass(cval,undefined!==sval),
    toBeUndefined: (cval)=>pass(cval,undefined===sval),
    toMatch: (cval)=>pass(cval,sval.match(cval)),
    toThrow: (cval)=>{
      try {
        sval()
        pass(cval,false)
      }
      catch(e) {
        pass(cval,true)
      }
    },
    toMatchObject: (cval)=>{
      passEqualJSON(cval)
    },
  }
}


require('./jester-tests.js')

},{"./jester-tests.js":3}]},{},[4]);
