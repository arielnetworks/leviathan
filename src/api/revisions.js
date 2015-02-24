
var Q = require('q');
var _ = require('underscore');
// DB Shemas
var persist = require('../persist');
var STATUS_CODES = require('http').STATUS_CODES;
var ApiUtil = require('./util');



var GetRevisions = module.exports['get'] = {};
var PostRevisions = module.exports['post'] = {};



GetRevisions[''] = function(req, res, next) {
  var query = req.query || {};
  persist.findRevisions(+query.skip, +query.limit, query.order)
  .then(ApiUtil.putResolvedValue(req))
  .catch(ApiUtil.putRejectedReason(req))
  .done(next);
};

GetRevisions[':id'] = function(req, res, next) {
  persist.findRevision(req.params.id)
  .then(function(current) {
    return { current: current };
  })
  .then(ApiUtil.putResolvedValue(req))
  .catch(ApiUtil.putRejectedReason(req))
  .done(next);
};

GetRevisions[':id/captures'] = function(req, res, next) {
  var query = req.query || {};
  Q.all([
    persist.findRevision(req.params.id),
    persist.findRevisionCaptures(req.params.id,
        +query.skip, +query.limit, query.order,
        query.status, query.checkedAs)
  ])
  .then(function(results) {
    return {
      current: results[0],
      items: results[1]
    };
  })
  .then(ApiUtil.putResolvedValue(req))
  .catch(ApiUtil.putRejectedReason(req))
  .done(next);
};

GetRevisions[':id/captures/:capture'] = function(req, res, next) {
  buildCapture(req.params.id, req.params.capture)
  .then(ApiUtil.putResolvedValue(req))
  .catch(ApiUtil.putRejectedReason(req))
  .done(next);
};

PostRevisions[':id/captures/:capture'] = function(req, res, next) {
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
  .then(ApiUtil.putResolvedValue(req))
  .catch(ApiUtil.putRejectedReason(req))
  .done(next);
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
