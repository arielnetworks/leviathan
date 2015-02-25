
var persist = require('../persist');
var ApiUtil = require('./util');



var GET = module.exports['get'] = {};



GET[''] = function(req) {
  var query = req.query || {};
  return persist.findCaptures(+query.skip, +query.limit)
  .then(function(docs) {
    return {
      items: docs || []
    };
  })
};
