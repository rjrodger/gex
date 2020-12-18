# gex

[![npm version](https://badge.fury.io/js/gex.svg)](https://badge.fury.io/js/gex)
[![Build](https://github.com/rjrodger/gex/workflows/build/badge.svg)](https://github.com/rjrodger/gex/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/rjrodger/gex/badge.svg?branch=main)](https://coveralls.io/github/rjrodger/gex?branch=main)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/13588/branches/232094/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=13588&bid=232094)
[![Maintainability](https://api.codeclimate.com/v1/badges/5def990719578771abb3/maintainability)](https://codeclimate.com/github/rjrodger/gex/maintainability)
[![Dependency Status](https://david-dm.org/rjrodger/gex.svg)](https://david-dm.org/rjrodger/gex)



## Glob expressions for JavaScript

*"When regular expressions are just too hard!"*

Match glob expressions using * and ? against any JavaScript data type. 
The character * means match anything of any length, the character ? means match exactly one of any character, 
and all other characters match themselves.

    const { Gex } = require('gex')

    Gex('a*').on( 'abc' ) // returns 'abc'
    Gex('a*c').on( 'abbbc' ) // returns 'abbbc'
    Gex('a?c').on( 'abc' ) // returns 'abc'

You can also match against objects and arrays:

    Gex('a*').on( ['ab','zz','ac'] ) // returns ['ab','ac']
    Gex('a*').on( {ab:1,zz:2,ac:3} ) // returns {ab:1,ac:3}

And also match against multiple globs:

    Gex(['a*','b*']).on( 'bx' ) // returns 'bx'
    Gex(['a*','b*']).on( ['ax','zz','bx'] ) // returns ['ax','bx']


One of the most useful things you can do with this library is quick
assertions in unit tests. For example if your objects contain dates,
randomly generated unique identifiers, or other data irrelevant for
testing, `Gex` can help you ignore them when you use `JSON.stringify`:

    var entity = {created: new Date().getTime(), name:'foo' }
    assert.ok( Gex('{"created":*,"name":"foo"}').on( JSON.stringify(entity) ) )

If you need to use globbing on files, here's how apply a glob to a list of files in a folder:

    var fs = require('fs')
    fs.readdir('.',function(err,files){ 
      var pngs = Gex('*.png').on(files) 
    })

And that's it!


## Installation

    npm install gex

And in your code:

    const { Gex } = require('gex')

Or clone the git repository:
    git clone git://github.com/rjrodger/gex.git


This library depends on the excellent underscore module: [underscore](https://github.com/documentcloud/underscore)


## Usage

The `Gex` object is a function that takes a single argument, the glob
expression.  This returns a `Gex` object that has only one function
itself: `on`. The `on` function accepts any JavaScript data type, and operates as follows:

   * strings, numbers, booleans, dates, regexes: converted to string form for matching, returned as themselves
   * arrays: return a new array with all the elements that matched. Elements are not modified, but are converted to strings for matching. Does not recurse into elements.
   * objects: return a new object with with all the property *names* that matched. Values are copied by reference. 
   * null, NAN, undefined: never match anything

## Support

If you're using this library, feel free to contact me on twitter if you have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

This module works on both Node.js and browsers.



## License
Copyright (c) 2010-2020, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ./LICENSE


