
var Q = require('q');
var _ = require('underscore');
var persist = require('../persist');



var GET = module.exports['get'] = {};
var POST = module.exports.post = {};



GET[''] = function(req) {
  var query = req.query || {};
  return persist.findRevisions(query.page, query.order);
};

GET[':id'] = function(req) {
  return persist.findRevision(req.params.id)
  .then(function(current) {
    return { current: current };
  });
};

GET[':id/captures'] = function(req) {
  var query = req.query || {};
  return Q.all([
    persist.findRevision(req.params.id),
    persist.findRevisionCaptures(req.params.id,
        +query.page, query.order,
        query.status, query.checkedAs)
  ])
  .then(function(results) {
    var current = results[0];
    var meta = results[1].meta;
    var items = results[1].items;
    return _.extend(results[1], {
      current: current,
      meta: meta,
      items: items
    });
  });
};

GET[':id/captures/:capture'] = function(req) {
  return buildCapture(req.params.id, req.params.capture);
};

POST[':id/captures/:capture'] = function(req) {
  var data = {};
  var checkedAs = getStatusFromReqest(req);
  if (checkedAs) {
    data['checkedAs'] = checkedAs;
  }
  return persist.updateCapture(req.params.id, req.params.capture, data)
  .then(function(doc) {
    if (doc) {
      return buildCapture(req.params.id, req.params.capture);
    }
    throw new Error('404');
  });
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
