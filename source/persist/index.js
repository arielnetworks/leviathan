
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');
var _ = require('underscore');
var isTesting = process.env.NODE_ENV == 'test';



// TODO: Use Global Configuration
var collectionNames = ['revisions', 'reports', 'captures'];
var db = require('mongoskin').db('mongodb://127.0.0.1:27017/ttt', {native_parser: true, options: { w: 1 }});
collectionNames.forEach(db.bind.bind(db));



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findReports = findReports;
module.exports.findReport = findReport;
module.exports.findCaptures = findCaptures;
module.exports.findOrCreateCapture = findOrCreateCapture;
module.exports.upsertRevision = upsertRevision;
module.exports.updateReport = updateReport;
module.exports.updateCapture = updateCapture;
module.exports._destroy = _destroy;



function _destroy() {
  return Q.all(collectionNames.map(function(name) {
    return Q.ninvoke(db[name], 'count')
    .then(function(count) {
      if (count > 0) Q.ninvoke(db[name], 'drop');
    });
  }));
}

function findOrCreateCapture(capture, expectedRevisionIfInsert) {
  var query = {capture: capture};
  return Q.ninvoke(db.captures, 'findOne', query, {_id: false})
  .then(function(doc) {
    if (doc) return doc;
    return Q.ninvoke(db.captures, 'update', query, {
      expectedRevision: [expectedRevisionIfInsert],
      capture: capture,
      updatedAt: isTesting ? new Date('1970-01-01T00:00:00.000Z') : undefined,
      updatedBy: 'system'
    }, {upsert: true})
    .then(function() {
      return Q.ninvoke(db.captures, 'findOne', query, {_id: false});
    });
  });
}

function updateCapture(capture, expectedRevision) {
  return Q.ninvoke(db.captures, 'update',
      {capture: capture},
      {$addToSet: {expectedRevision: expectedRevision}},
      {upsert: false})
  .then(function() {
    return Q.ninvoke(db.captures, 'findOne', {capture: capture});
  });
}

function updateReport(rid, capture, data) {
  var query = {revision: rid, capture: capture};
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return Q.ninvoke(db.reports, 'update',
      query,
      {$set: data},
      {upsert: true})
  .then(function() {
    return Q.ninvoke(db.reports, 'findOne', query, {_id: false});
  });
}

function findCaptures(skip, limit, order) {
  order = parseOrderParam_(order);
  return Q.ninvoke(db.captures.find({}, {_id: false})
      .skip(skip || 0)
      .limit(limit || 20)
      .sort(order.of || 'updatedAt', order.by || -1),
  'toArray');
}

function findReport(rid, capture) {
  return Q.ninvoke(db.reports, 'findOne', {revision: rid, capture: capture}, {_id: false});
}

function findReports(rid, skip, limit, order, status, checkedAs) {
  var where = { revision: rid };
  var order = parseOrderParam_(order);
  if (status) where.status = status;
  if (checkedAs) where.checkedAs = checkedAs;
  return Q.ninvoke(db.reports.find(where, {_id: false})
      .skip(skip || 0)
      .limit(limit || 20)
      .sort(order.of || 'id', order.by || -1),
  'toArray');
}

function upsertRevision(id, revisionAt) {
  var data = { id: id };
  if (revisionAt) data.revisionAt = revisionAt;
  if (isTesting) data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');

  return Q.ninvoke(db.revisions, 'update', {id: id}, {$set: data}, {upsert: true})
  .then(findRevision.bind(null, id));
}

function findRevision(id) {
  return Q.all([
    Q.ninvoke(db.revisions, 'findOne', {id: id}, {_id: false}),
    Q.ninvoke(db.reports, 'count', { revision: id, checkedAs: 'UNPROCESSED' }),
    Q.ninvoke(db.reports, 'count', { revision: id, checkedAs: 'IS_OK' }),
    Q.ninvoke(db.reports, 'count', { revision: id, checkedAs: 'IS_BUG' })
  ])
  .then(function(result) {
    var revision = result.shift();
    var counts = result;
    return _.extend(revision, {
      total: counts.reduce(function(total, c) { return total + c }, 0),
      'UNPROCESSED': counts[0],
      'IS_OK': counts[1],
      'IS_BUG': counts[2]
    });
  });
}

function findRevisions(skip, limit, order) {
  order = parseOrderParam_(order);
  return Q.ninvoke(db.revisions.find({}, {_id: false})
      .skip(skip)
      .limit(limit)
      .sort(order.of || 'revisionAt', order.by || -1),
  'toArray');
}

function parseOrderParam_(order) {
  if (!_.isString(order)) return {};
  if (!~order.indexOf(' ')) return {};
  var splitted = {};
  if ((splitted = order.split(' ')).length != 2) return {};
  return {
    of: splitted[0],
    by: splitted[1] == 'ASC' ? 1 : -1
  };
}
(function testParseOrderParam_() {
  var order1 = parseOrderParam_('id ASC');
  assert.equal(order1.of, 'id');
  assert.equal(order1.by, 1);
  var order2 = parseOrderParam_('updatedAt DESC');
  assert.equal(order2.of, 'updatedAt');
  assert.equal(order2.by, -1);
})();
