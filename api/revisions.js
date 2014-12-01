
var Q = require('q');
var _ = require('underscore');
// DB Shemas
var Schema = require('../persist').Schema;
var persist = require('../persist');
var STATUS_CODES = require('http').STATUS_CODES;



var GetRevisions = module.exports['get'] = {};
var PostRevisions = module.exports['post'] = {};



GetRevisions['index'] = function(req, res) {
  persist.findRevisions(+req.param('skip'), +req.param('limit'), req.param('order'))
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
    persist.findReports(req.param('id'),
        +req.param('skip'), +req.param('limit'), req.param('order'),
        req.param('status'), req.param('checkedAs'))
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
  persist.findReport(req.param('id'), req.param('cid'))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

PostRevisions[':id/captures/:cid'] = function(req, res) {
  var data = {};
  var checkedAs = getStatusFromReqest(req);
  if (checkedAs) data['checkedAs'] = checkedAs;
  var doc;
  persist.updateCapture(req.param('id'), req.param('cid'), data)
  .then(function(doc) {
    if (doc) {
      persist.updateRevision(req.param('id')); // Without waiting.
      return doc;
    }
    res.status(404);
    return {
      error: true,
      reason: STATUS_CODES[404]
    };
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
  var v = req.body && req.body['checkedAs'];
  if (!v) return null;
  v = v.toUpperCase();
  if (!_.contains(Status, v)) return null;
  return v;
}
