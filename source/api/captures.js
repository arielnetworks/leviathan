
var persist = require('../persist');



var GetRevisions = module.exports['get'] = {};



GetRevisions['index'] = function(req, res) {
  persist.findCaptures(+req.param('skip'), +req.param('limit'))
  .then(function(docs) {
    res.json({
      captures: docs || []
    });
  })
  .catch (handleError.bind(null, res));
};

function handleError(res, reason) {
  res.json({
    error: 1,
    reason: reason
  });
}
