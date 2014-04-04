/* jshint node:true */
'use strict';

var util = require('util');
var path = require('path');
var chalk = require('chalk');
var gutil = require('gulp-util');
var extend = require('lodash.assign');
var through = require('through2');
var PluginError = gutil.PluginError;

module.exports = function(name, options) {
  options = options || {};

  var combined;

  function combine(file, encoding, next) {

    var buffers;
    if(!combined) {
      combined = new gutil.File({
        path: path.join(path.dirname(file.path), name || path.basename(file.path)),
        base: file.base,
        cwd: file.cwd,
        contents: new Buffer('')
      });
      buffers = [combined.contents];
    } else {
      buffers = [combined.contents, new Buffer(options.separator || require('os').EOL)];
    }

    var contents = file.contents;
    if(options.process === false) {
      return next();
    } else if(typeof options.process === 'function') {
      contents = new Buffer(options.process.call(file, contents.toString()));
    } else if(typeof options.process === 'object')  {
      contents = new Buffer(gutil.template(contents, extend({file: file}, options.process)));
    }

    buffers.push(contents);
    combined.contents = Buffer.concat(buffers);

    next();
  }

  function flush(next) {
    /* jshint validthis:true*/
    this.push(combined);
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
