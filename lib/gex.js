/* Copyright (c) 2011-2013 Richard Rodger, MIT License */
"use strict";


var _ = require('underscore')


function Gex(gexspec) {
  var self = this

  function dodgy(obj) {
    return ( _.isNull(obj)
             || _.isNaN(obj) 
             || _.isUndefined(obj) )
  }

  function clean(gexexp) {
    var gexstr = ''+gexexp
    if( _.isNull(gexexp)
        || _.isNaN(gexexp) 
        || _.isUndefined(gexexp) ) {
      gexstr = ''
    } 
    return gexstr
  }

  function gexstr(gexexp) {
    var gs = []
    if( _.isArray(gexexp) || _.isArguments(gexexp) ) {
      for( var i = 0; i < gexexp.length; i++ ){
        var s = clean(gexexp[i])
        gexexp.push( 
          ( '*' == s || '?' == s ) ? s
          : self.esc(s)
        )
      }
      gs = gs.join('')
    }
    else {
      gs = clean(gexexp)
    }
    return gs
  }


  self.on = function(obj) {
    if( _.isString(obj) 
        || _.isNumber(obj) 
        || _.isBoolean(obj) 
        || _.isDate(obj) 
        || _.isRegExp(obj) 
      ) 
    {
      return (!!re.exec(''+obj)) ? obj : null
    }

    else if( _.isArray(obj)
             || _.isArguments(obj)
           ) {
      var out = []
      for( var i = 0; i < obj.length; i++ ) {
        if( !dodgy(obj[i]) && !!re.exec(''+obj[i]) ) {
          out.push(obj[i])
        }
      }
      return out
    }

    else if( dodgy(obj) ) {
      return null
    }
    
    else if( 'object' == typeof(obj) ) {
      var out = {}
      for( var p in obj ) {
        if( obj.hasOwnProperty(p) ) {
          if( !!re.exec(p) ) {
            out[p] = obj[p]
          }
        }
      }
      return out
    }

    else {
      return null
    }
  }

  self.esc = function(gexexp) {
    var gexstr = clean(gexexp)
    gexstr = gexstr.replace(/\*/g,'**')
    gexstr = gexstr.replace(/\?/g,'*?')
    return gexstr
  }


  self.re = function(gs) {
    if( '' == gs || gs ) {
      var gs = self.escregexp(gs)

      // use [\s\S] instead of . to match newlines
      gs = gs.replace(/\\\*/g,'[\\s\\S]*')
      gs = gs.replace(/\\\?/g,'[\\s\\S]')
      //gs = gs.replace(/\\\*/g,'.*')
      //gs = gs.replace(/\\\?/g,'.')

      // escapes ** and *?
      gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]\*/g,'\\\*')
      gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]/g,'\\\?')

      gs = '^'+gs+'$'

      return new RegExp(gs)
    }
    else {
      return re
    }
  }

  self.escregexp = function(restr) {
    return restr ? (''+restr).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : ''
  }

  self.toString = function() {
    return str
  }

  var str = gexstr(gexspec)
  var re  = self.re(str)
}


function gex(gexexp) {
  var gex = new Gex(gexexp)
  return gex
}
gex.Gex = Gex


module.exports = gex