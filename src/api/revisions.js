
var Q = require('q');
var _ = require('underscore');
// DB Shemas
var persist = require('../persist');
var STATUS_CODES = require('http').STATUS_CODES;



var GetRevisions = module.exports['get'] = {};
var PostRevisions = module.exports['post'] = {};



GetRevisions['index'] = function(req, res) {
  var query = req.query || {};
  persist.findRevisions(+query.skip, +query.limit, query.order)
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

GetRevisions[':id'] = function(req, res) {
  persist.findRevision(req.params.id)
  .then(function(current) {
    return { current: current };
  })
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

GetRevisions[':id/captures'] = function(req, res) {
  var query = req.query || {};
  Q.all([
    persist.findRevision(req.params.id),
    persist.findRevisionCaptures(req.params.id,
        +query.skip, +query.limit, query.order,
        query.status, query.checkedAs)
  ])
  .then(function(results) {
    res.json({
      current: results[0],
      items: results[1]
    });
  })
  .catch (handleError.bind(null, res));
};

GetRevisions[':id/captures/:capture'] = function(req, res) {
  buildCapture(req.params.id, req.params.capture)
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

PostRevisions[':id/captures/:capture'] = function(req, res) {
  var data = {};
  var checkedAs = getStatusFromReqest(req);
  if (checkedAs) {
    data['checkedAs'] = checkedAs;
  }
  persist.updateCapture(req.params.id, req.params.capture, data)
  .then(function(doc) {
    if (doc) {
      return buildCapture(req.params.id, req.params.capture);
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



function buildCapture(revision, capture) {
  return Q.all([
    persist.findRevisionCapture(revision, capture),
    persist.findSiblingRevisionCaptureOf(revision, capture, -1),
    persist.findSiblingRevisionCaptureOf(revision, capture, 1)
  ])
  .then(function(results) {
    var current = results[0];
    var previous = results[1];
    var next = results[2];
    current['@siblings'] = {};
    if (previous) current['@siblings'].previous = previous;
    if (next) current['@siblings'].next = next;
    return { current: current };
  })
}

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
