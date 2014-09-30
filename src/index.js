/* jshint node:true */
'use strict';

var util = require('util');
var os = require('os');
var path = require('path');
var chalk = require('chalk');
var gutil = require('gulp-util');
var extend = require('lodash.assign');
var through = require('through2');
var multipipe = require('multipipe');
var PluginError = gutil.PluginError;
var Concat = require('concat-with-sourcemaps');

var defaults = {
  sep: os.EOL,
  process: false
};

var concat = module.exports = function(name, config) {

  var options = extend({}, defaults, config || {});
  var concat, firstFile, fileName;

  function parsePath(p) {
    var extname = path.extname(p);
    return {
      dirname: path.dirname(p),
      basename: path.basename(p, extname),
      extname: extname,
      sep: path.sep
    };
  }

  function combine(file, encoding, next) {

    if (!firstFile) {
      firstFile = file;
      // Default path to first file basename
      fileName = name || path.basename(file.path);
      // Support path as a function
      if(typeof name === 'function') {
        var parsedPath = parsePath(file.path);
        var result = name(parsedPath) || parsedPath;
        fileName = typeof result === 'string' ? result : result.basename + result.extname;
      }
      // Initialize concat
      concat = new Concat(!!file.sourceMap, fileName, options.sep);
    }

    var contents = file.contents;
    // Support process as a function
    if(typeof options.process === 'function') {
      contents = new Buffer(options.process.call(file, contents.toString()));
    // Support process as an object fed to gutil.template
    } else if(typeof options.process === 'object')  {
      contents = new Buffer(gutil.template(contents, extend({file: file}, options.process)));
    }

    concat.add(file.relative, contents.toString(), file.sourceMap);

    next();
  }

  function flush(next) {
    if (firstFile) {

      var joinedFile = firstFile.clone();

      joinedFile.path = path.join(options.cwd || firstFile.base, fileName);
      joinedFile.base = options.base || firstFile.base;
      joinedFile.contents = new Buffer(concat.content);

      if (concat.sourceMapping) {
        joinedFile.sourceMap = JSON.parse(concat.sourceMap);
      }

      /* jshint validthis:true */
      this.push(joinedFile);
    }
    next();
  }

  return through.obj(combine, flush);

};

module.exports.header = function(header, locals) {
  return through.obj(function(file, encoding, next) {
    file.contents = Buffer.concat([new Buffer(gutil.template(header, extend({file: file}, locals))), file.contents]);
    next(null, file);
  });
};

module.exports.footer = function(footer, locals) {
  return through.obj(function(file, encoding, next) {
    file.contents = Buffer.concat([file.contents, new Buffer(gutil.template(footer, extend({file: file}, locals)))]);
    next(null, file);
  });
};

function processJsSource(src) {
  /* jshint validthis:true */
  return os.EOL + '// Source: ' + this.relative + os.EOL + src.trim().replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
}

module.exports.scripts = function(name, options) {
  if(!options) options = {};
  options.process = processJsSource;
  return multipipe(
    concat(name, options),
    concat.header(['(function(window, document, undefined) {', os.EOL, '\'use strict\';', os.EOL].join('')),
    concat.footer([os.EOL, os.EOL, '})(window, document);', os.EOL].join(''))
  );
};

