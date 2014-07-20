var pkg = require('../package.json');
var concat = require('../' + pkg.main);
var path = require('path');
var extend = require('lodash.assign');
var File = require('gulp-util').File;
var Buffer = require('buffer').Buffer;
var should = require('should');
require('mocha');

describe('gulp-concat-util', function() {

  var defaults = {
    path: '/tmp/test/fixture/file.js',
    cwd: '/tmp/test/',
    base: '/tmp/test/fixture/'
  };

  beforeEach(function() {
  });

  describe('header()', function() {

    it('should pass through files', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));

      var stream = concat.header();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();');
        newFile.path.should.equal('/tmp/test/fixture/file.js');
        newFile.relative.should.equal('file.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

    it('should prepend templated content to file', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));

      var stream = concat.header('\'use strict\';\n// <%= file.path %>\n');
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), '\'use strict\';\n// /tmp/test/fixture/file.js\n' + 'foo();');
        newFile.path.should.equal('/tmp/test/fixture/file.js');
        newFile.relative.should.equal('file.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

  });

  describe('footer()', function() {

    it('should pass through files', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));

      var stream = concat.footer();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();');
        newFile.path.should.equal('/tmp/test/fixture/file.js');
        newFile.relative.should.equal('file.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

    it('should prepend templated content to file', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));

      var stream = concat.footer('\n// <%= file.path %>\n');
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();' + '\n// /tmp/test/fixture/file.js\n');
        newFile.path.should.equal('/tmp/test/fixture/file.js');
        newFile.relative.should.equal('file.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

  });

  describe('concat()', function() {

    it('should pass through files', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));

      var stream = concat();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();');
        newFile.path.should.equal('/tmp/test/fixture/file.js');
        newFile.relative.should.equal('file.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

    it('should concat file contents', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));
      var fixture2 = new File(extend({contents: new Buffer('bar();')}, defaults));

      var stream = concat('baz.js');
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();' + require('os').EOL + 'bar();');
        newFile.path.should.equal('/tmp/test/fixture/baz.js');
        newFile.relative.should.equal('baz.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.write(fixture2);
      stream.end();

    });

    it('should support name as a function', function(done) {

      var fixture = new File(extend({contents: new Buffer('foo();')}, defaults));
      var fixture2 = new File(extend({contents: new Buffer('bar();')}, defaults));

      var stream = concat(function(path) {
        should.exist(path.basename);
        should.exist(path.dirname);
        should.exist(path.extname);
        path.basename = 'qux';
      });
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        should.equal(newFile.contents.toString(), 'foo();' + require('os').EOL + 'bar();');
        newFile.path.should.equal('/tmp/test/fixture/qux.js');
        newFile.relative.should.equal('qux.js');
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.write(fixture2);
      stream.end();

    });

  });

});
