
var Q = require('q');
var _ = require('underscore');
// DB Shemas
var persist = require('../persist/mongodb');
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
