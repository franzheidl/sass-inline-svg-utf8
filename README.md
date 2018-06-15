#sass-inline-svg-utf8

[![Build Status](https://travis-ci.org/franzheidl/sass-inline-svg-utf8.svg?branch=master)](https://travis-ci.org/franzheidl/sass-inline-svg-utf8) [![npmjs](https://badge.fury.io/js/sass-inline-svg-utf8.svg)](https://www.npmjs.com/package/sass-inline-svg-utf8)

Inline SVGs in your CSS as html-encoded UTF-8 with node-sass. 

Inlining is good because fewer requests, html-encoded is good for SVG because it is smaller than base64 (by about 30% on average).

String replacement is good because you can use 'variables' in your SVG source files and replace them on a per-inlined-instance basis. Use case? You need a white, a black, and a blue arrow icon, and can create them on the fly when inling from a single source file. Good because if the arrow needs to be changed, you only have to change on file, not three.

## Install

    npm install --save-dev sass-inline-svg-utf8

## Usage

    var sass = require('node-sass');
    var sassInlineSVG = require('sass-inline-svg-utf8');
    var pathToSvgDir = path.resolve(__dirname,'./my-path-to-direcory-with-swg') 

    sass.render({
      functions: sassInlineSVG(pathToSvgDir), //pathToSvgDir - optional.
      file: file,
      outfile: outfile
    }, function(error, result) {
        /* Your code here */
    });

In your Sass:

    .myClass {
      //path can be relative to the directory, where you execute your build script
      background-image: inline-svg('./images/logo.svg');
    }
    .myClass {
      //you can provide path to the directory with svg files as a parameter to function and use reletive pathes
      background-image: inline-svg('logo.svg');
    }
    .myClass {
      //path can be relative to the current .sass file. 
      background-image: inline-svg('../images/logo.svg');
    }
   

For optimal results and minimal filesize, run your SVGs through [SVGO](https://github.com/svg/svgo) first (Actually, I'm on the fence whether to include SVGO optimization by default when inlining, but I’m not sure because of various settings/complexity). If you have a strong opinion on that, let’s dicuss [here](https://github.com/franzheidl/sass-inline-svg-utf8/issues/1).

## Advanced Usage w/ String replacement

In your SVG source, you can use variable strings to replace when inlining:

    <path fill="fillcolor" […] />

In your Sass, you can pass a map of variables to replace as a second parameter:

    .myClass {
      background-image: inline-svg('./images/arrow.svg', { fillcolor: '#000000'});
    }
    
This will replace all occurences of `fillcolor` in the SVG file with `#000000` in the inlined SVG.

If you want to use `$`-prepended variable names to match your Sass variables, quote them in the Sass map like `{ '$fillcolor': '#000000' }`. 

This will result in (not html encoded here for readability):

    <path fill="#000000" […] />

So to create three instances of the same SVG source with different fill colors in your CSS:

    .red-arrow {
      background-image: inline-svg( './images/arrow.svg', ( fillcolor: 'red'));
    }

    .blue-arrow {
      background-image: inline-svg( './images/arrow.svg', ( fillcolor: 'blue'));
    }

    .black-arrow {
      background-image: inline-svg( './images/arrow.svg', ( fillcolor: 'black'));
    }

### Using colors

To use non-named colors like hex, rgba etc., these need to be passed as a quoted string (this is down to the current behavior of node-sass/libsass):

    .white-arrow {
      background-image: inline-svg( './images/arrow.svg', ( fillcolor: '#fff'));
    }
    
Whn using variables that may contain colors, these need to be evaluated to be on the safe side:

    .custom-arrow {
      background-image: inline-svg( './images/arrow.svg', ( fillcolor: #{$custom-color}));
    }
    
I have opened [this issue](https://github.com/sass/node-sass/issues/1907) with node-sass to make the quoting/evaluating unnecessary (fingers crossed…)
  
