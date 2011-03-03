

function Gex(gexexp) {
  var self = this

  var gexstr = gexexp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  gexstr = gexstr.replace(/\\\*/g,'.*')
  gexstr = gexstr.replace(/\\\?/g,'.')
  gexstr = '^'+gexstr+'$'

  var re = new RegExp(gexstr)


  self.on = function(ins) {
    var inarr = true
    if( 'string' == typeof(ins) ) {
      ins = [ ins ]
      inarr = false
    }

    var outs = []
    
    for( var i = 0; i < ins.length; i++ ) {
      var m = re.exec(ins[i])
      if( m ) {
        outs.push( m[0] ) 
      }
    }

    if( !inarr ) {
      outs = 0 == outs.length ? null : outs[0]
    }

    return outs
  }
}


function gex(gexexp) {
  var gex = new Gex(gexexp)
  return gex
}
gex.Gex = Gex


module.exports = gex