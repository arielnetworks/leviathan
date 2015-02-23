
var persist = require('../persist');



var GetRevisions = module.exports['get'] = {};



GetRevisions['index'] = function(req, res) {
  var query = req.query || {};
  persist.findCaptures(+query.skip, +query.limit)
  .then(function(docs) {
    res.json({
      items: docs || []
    });
  })
  .catch(handleError.bind(null, res));
};

function handleError(res, reason) {
  res.json({
    error: 1,
    reason: reason
  });
}
