/* Copyright (c) 2011-2013 Richard Rodger, MIT License, https://github.com/rjrodger/patrun */


(function() {
  "use strict";

  var root        = this
  var previous_gex = root.gex

  var has_require = typeof require !== 'undefined'

  var _ = root._

  if( typeof _ === 'undefined' ) {
    if( has_require ) {
      _ = require('underscore')
    }
    else throw new Error('gex requires underscore, see http://underscorejs.org');
  }


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

    function match(str) {
      str = ''+str
      var hasmatch = false
      var gexstrs = _.keys(gexmap)
      //console.log(gexstrs)
      for(var i = 0; i < gexstrs.length && !hasmatch; i++ ) {
        hasmatch = !!gexmap[gexstrs[i]].exec(str)
        //console.log(hasmatch+' '+gexstrs[i]+' '+str)
      }
      return hasmatch
    }


    self.noConflict = function() {
      root.gex = previous_gex;
      return self;
    }


    self.on = function(obj) {
      if( _.isString(obj) 
          || _.isNumber(obj) 
          || _.isBoolean(obj) 
          || _.isDate(obj) 
          || _.isRegExp(obj) 
        ) 
      {
        //return (!!re.exec(''+obj)) ? obj : null
        return match(obj) ? obj : null
      }

      else if( _.isArray(obj)
               || _.isArguments(obj)
             ) {
               var out = []
               for( var i = 0; i < obj.length; i++ ) {
                 //if( !dodgy(obj[i]) && !!re.exec(''+obj[i]) ) {
                 if( !dodgy(obj[i]) && match(obj[i]) ) {
                   out.push(obj[i])
                 }
               }
               return out
             }

      else if( dodgy(obj) ) {
        return null
      }
      
      else if( _.isObject(obj) ) {
        var out = {}
        for( var p in obj ) {
          if( obj.hasOwnProperty(p) ) {
            //if( !!re.exec(p) ) {
            if( match(p) ) {
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
        var gexstrs = _.keys(gexmap)
        return 1 == gexstrs.length ? gexmap[gexstrs[0]] : _.clone(gexmap)
      }
    }

    self.escregexp = function(restr) {
      return restr ? (''+restr).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : ''
    }

    self.toString = function() {
      return ''+_.keys(gexmap)
    }


    var gexstrs = (null==gexspec||_.isNaN(gexspec)) ? [] : _.isArray(gexspec) ? gexspec : [gexspec]
    //console.log(gexstrs)

    var gexmap = {}

    _.each( gexstrs, function(str) {
      var re = self.re(str)
      gexmap[str]=re
    })

    //console.dir(gexmap)
  }


  function gex(gexspec) {
    var gex = new Gex(gexspec)
    return gex
  }
  gex.Gex = Gex



  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = gex
    }
    exports.gex = gex
  } 
  else {
    root.gex = gex
  }

}).call(this);
