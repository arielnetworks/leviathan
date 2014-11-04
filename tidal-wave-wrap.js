
var path = require('path');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter
var Opticalflow = require('node-optical-flow');

module.exports = TidalWave;

function TidalWave(revisionId) {
  EventEmitter.call(this);

  this.options_ = {
    expectedPath: path.resolve(__dirname, '../tidal-wave/test/fixture/expected'),
    targetPath: path.resolve(__dirname, '../tidal-wave/test/fixture/revision' + revisionId),
    span: 10,    // Optional
    threshold: 5 // Optional 
  };

  this.o = new Opticalflow;
  this.o.on('message', this.emit.bind(this, 'message'));
  this.o.on('error', this.emit.bind(this, 'error'));
  this.o.on('finish', this.emit.bind(this, 'finish'));

  this.o.calc(this.options_.expectedPath, this.options_.targetPath, {});
}

TidalWave.prototype = new EventEmitter;

