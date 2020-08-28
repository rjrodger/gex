/* Copyright (c) 2011-2020 Richard Rodger, MIT License */

module.exports = gex

function gex(gexspec) {
  return new Gex(gexspec)
}

gex.Gex = Gex

function Gex(gexspec) {
  var self = this

  function dodgy(obj) {
    return null == obj || Number.isNaN(obj)
  }

  function clean(gexexp) {
    var gexstr = '' + gexexp
    if (dodgy(gexexp)) {
      gexstr = ''
    }
    return gexstr
  }

  function match(str) {
    str = '' + str
    var hasmatch = false
    var gexstrs = Object.keys(gexmap)

    for (var i = 0; i < gexstrs.length && !hasmatch; i++) {
      hasmatch = !!gexmap[gexstrs[i]].exec(str)
    }
    return hasmatch
  }

  self.on = function (obj) {
    if (null == obj) {
      return null
    }

    var typeof_obj = typeof obj
    if (
      'string' === typeof_obj ||
      'number' === typeof_obj ||
      'boolean' === typeof_obj ||
      obj instanceof Date ||
      obj instanceof RegExp
    ) {
      return match(obj) ? obj : null
    } else if (Array.isArray(obj)) {
      var out = []
      for (var i = 0; i < obj.length; i++) {
        if (!dodgy(obj[i]) && match(obj[i])) {
          out.push(obj[i])
        }
      }
      return out
    } else {
      var outobj = {}
      for (var p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
          if (match(p)) {
            outobj[p] = obj[p]
          }
        }
      }
      return outobj
    }
  }

  self.esc = function (gexexp) {
    var gexstr = clean(gexexp)
    gexstr = gexstr.replace(/\*/g, '**')
    gexstr = gexstr.replace(/\?/g, '*?')
    return gexstr
  }

  self.re = function (gs) {
    if ('' === gs || gs) {
      gs = self.escregexp(gs)

      // use [\s\S] instead of . to match newlines
      gs = gs.replace(/\\\*/g, '[\\s\\S]*')
      gs = gs.replace(/\\\?/g, '[\\s\\S]')

      // escapes ** and *?
      gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]\*/g, '\\*')
      gs = gs.replace(/\[\\s\\S\]\*\[\\s\\S\]/g, '\\?')

      gs = '^' + gs + '$'

      return new RegExp(gs)
    } else {
      var gexstrs = Object.keys(gexmap)
      return 1 == gexstrs.length ? gexmap[gexstrs[0]] : { ...gexmap }
    }
  }

  self.escregexp = function (restr) {
    return restr ? ('' + restr).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : ''
  }

  self.toString = function () {
    return null != desc ? desc : (desc = 'gex[' + Object.keys(gexmap) + ']')
  }

  self.inspect = function () {
    return self.toString()
  }

  var gexstrs = Array.isArray(gexspec) ? gexspec : [gexspec]
  var gexmap = {}
  var desc

  gexstrs.forEach(function (str) {
    str = clean(str)
    var re = self.re(str)
    gexmap[str] = re
  })
}
