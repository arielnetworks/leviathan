
var Q = require('q');
var _ = require('underscore');

// DB Shemas
var Schema = require('../persist').Schema;
var persist = require('../persist');



var GetRevisions = module.exports['get'] = {};
var PostRevisions = module.exports['post'] = {};



GetRevisions['index'] = function(req, res) {
  persist.findRevisions(+req.param('skip'), +req.param('limit'), {'id': -1})
  .then(function(docs) {
    res.json({
      revisions: docs || []
    });
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id'] = function(req, res) {
  persist.findRevision(req.param('id'))
  .then(function(doc) {
    res.json(doc || {});
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id/captures'] = function(req, res) {
  Q.all([
    persist.findRevision(req.param('id')),
    persist.findCaptures(req.param('id'), +req.param('skip'), +req.param('limit'), {'id': -1})
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
  persist.findCapture(req.param('id'), req.param('cid'))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

PostRevisions[':id/captures/:cid'] = function(req, res) {
  var data = {};
  var status = getStatusFromReqest(req);
  if (status) data['modifiedStatus'] = status;
  persist.updateCapture(req.param('id'), req.param('cid'), data)
  .then(function(numUpdated) {
    if (numUpdated > 0) {
      return persist.findCapture(req.param('id'), req.param('cid'));
    } else {
      return { error: true, reason: 'Document Not Updated.', params: req.params };
    }
  })
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};



function handleError(res, reason) {
  res.json({
    error: 1,
    reason: reason
  });
}
var Status = ['UNPROCESSED', 'IS_BUG', 'IS_OK'];
function getStatusFromReqest(req) {
  var v = req.body && req.body['modifiedStatus'];
  if (!v) return null;
  v = v.toUpperCase();
  if (!_.contains(Status, v)) return null;
  return v;
}
