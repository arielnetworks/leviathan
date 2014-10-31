
var Q = require('q');
var _ = require('underscore');

// DB Shemas
var Schema = require('../persistent').Schema;
var persistent = require('../persistent');



var GetRevisions = {};
module.exports['get'] = GetRevisions;



GetRevisions['index'] = function(req, res) {
  persistent.findRevisions(queryOption(+req.param('skip'), +req.param('limit'), 'id'))
  .then(function(docs) {
    res.json({
      revisions: docs || []
    });
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id'] = function(req, res) {
  persistent.findRevision(req.param('id'))
  .then(function(doc) {
    res.json(doc || {});
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id/captures'] = function(req, res) {
  Q.all([
    persistent.findRevision(req.param('id')),
    persistent.findCaptures(req.param('id'), queryOption(+req.param('skip'), +req.param('limit'), 'id'))
  ])
  .then(function(results) {
    res.json({
      revision: results[0],
      captures: results[1]
    });
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id/captures/:cid'] = function(req, res) {
  console.log(req.param('cid'));
  persistent.findCapture(req.param('id'), req.param('cid'))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};



function queryOption(skip, limit, descBy) {
  var sort = {};
  sort[descBy] = -1;
  return {
    skip: _.isNumber(skip) ? skip : 0,
    limit: _.isNumber(limit) ? limit : 20,
    sort: sort
  }
}

function handleError(res, reason) {
  res.json({
    error: 1,
    reason: reason
  });
}
