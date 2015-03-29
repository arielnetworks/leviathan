
var persist = require('../persist');



var GET = module.exports['get'] = {};



GET[''] = function(req) {
  var query = req.query || {};
  return persist.findCaptures(+query.page)
  .then(function(docs) {
    return {
      items: docs || []
    };
  });
};
