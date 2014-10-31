
var path = require('path');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter
var Opticalflow = require('node-optical-flow');

module.exports = TidalWave;

function TidalWave(options) {
  EventEmitter.call(this);

  this.options_ = _.extend({
    expectedPath: path.resolve(__dirname, '../tidal-wave/test/fixture/expected'),
    targetPath: path.resolve(__dirname, '../tidal-wave/test/fixture/revision2'),
    span: 10,    // Optional
    threshold: 5 // Optional 
  }, options);

  var that = this;
  this.o = new Opticalflow;
  this.o.on('message', function (message) { that.emit('message', message); });
  this.o.on('error', function (error) { that.emit('error', error); });
  this.o.on('finish', function (finish) { that.emit('finish', finish); });

  this.o.calc(this.options_.expectedPath, this.options_.targetPath, {});
}

TidalWave.prototype = new EventEmitter;

