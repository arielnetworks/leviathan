
var Q = require('q');
var _ = require('underscore');
// DB Shemas
var Schema = require('../persist').Schema;
var persist = require('../persist');
// var STATUS_CODES = require('http').STATUS_CODES;



var GetRevisions = module.exports['get'] = {};



GetRevisions['index'] = function(req, res) {
  persist.findCaptures(+req.param('skip'), +req.param('limit'), req.param('order'))
  .then(function(docs) {
    res.json({
      captures: docs || []
    });
  })
  .catch (handleError.bind(null, res));
};
