
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');
var _ = require('underscore');
var isTesting = process.env.NODE_ENV == 'test';



// TODO: Use Global Configuration
var collectionNames = ['revisions', 'captures'];
var db = require('mongoskin').db('mongodb://127.0.0.1:27017/ttt', {native_parser: true, options: { w: 1 }});
collectionNames.forEach(db.bind.bind(db));
var DEFAULT_LIMIT = 20;



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findRevisionCaptures = findRevisionCaptures;
module.exports.findRevisionCapture = findRevisionCapture;
module.exports.findSiblingRevisionCaptureOf = findSiblingRevisionCaptureOf;
module.exports.findCaptures = findCaptures;
module.exports.findLastExpectedCapture = findLastExpectedCapture;
module.exports.upsertRevision = upsertRevision;
module.exports.updateCapture = updateCapture;
module.exports.insertCapture = insertCapture;
module.exports._destroy = _destroy;



function _destroy() {
  return Q.all(collectionNames.map(function(name) {
    return Q.ninvoke(db[name], 'count')
    .then(function(count) {
      if (count > 0) Q.ninvoke(db[name], 'drop');
    });
  }));
}

function findLastExpectedCapture(capture, revisionAt) {
  return Q.ninvoke(db.captures.find({capture: capture, checkedAs: 'IS_OK', revisionAt: {$lt: revisionAt}}, {_id: false})
      .sort('revisionAt', -1).limit(1),
  'toArray').get(0);
}

function insertCapture(rid, capture, data) {
  data.updatedBy = 'system';
  // TODO: Use "exists"
  return Q.ninvoke(db.captures, 'findOne', {capture: capture}, {_id: false})
  .then(function(exists) {
    if (!exists) data.checkedAs = 'IS_OK';
    return updateCapture(rid, capture, data);
  });
}

function updateCapture(rid, capture, data) {
  var query = {revision: rid, capture: capture};
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return Q.ninvoke(db.captures, 'update',
      query,
      {$set: data},
      {upsert: true})
  .then(function() {
    return Q.ninvoke(db.captures, 'findOne', query, {_id: false});
  });
}

function findCaptures(skip, limit) {
  return Q.ninvoke(db.captures, 'aggregate', [
    {$match: {checkedAs: 'IS_OK'}},
    {$group: {
      _id: '$capture',
      updatedAt: {$max: '$updatedAt'},
      updatedBy: {$last: '$updatedBy'},
      expectedRevisions: { $push: '$revision' } } },
    {$sort: {_id: -1}},
    {$skip: skip || 0},
    {$limit: limit || DEFAULT_LIMIT}
  ]);
}

function findSiblingRevisionCaptureOf(rid, capture, direction) {
  return Q.ninvoke(
      db.captures.find({
        revision: rid,
        capture: direction > 0 ? {$gt: capture} : {$lt: capture}
      }, {_id: false})
      .sort({'captureName': 1}).limit(1),
  'toArray').then(function(docs) {
    return docs ? docs[0] : null
  });
}

function findRevisionCapture(rid, capture) {
  return Q.ninvoke(db.captures, 'findOne', {revision: rid, capture: capture}, {_id: false});
}

function findRevisionCaptures(rid, skip, limit, order, status, checkedAs) {
  var query = { revision: rid };
  var order = parseOrderParam_(order);
  if (status) query.status = status;
  if (checkedAs) query.checkedAs = checkedAs;
  return Q.ninvoke(db.captures.find(query, {_id: false})
      .skip(skip || 0)
      .limit(limit || DEFAULT_LIMIT)
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
    Q.ninvoke(db.captures, 'aggregate',
      {$match: {revision: id}},
      {$group: {
        _id: '$checkedAs',
        count: {$sum: 1} }}
    )
  ])
  .then(function(result) {
    var revision = result[0];
    var aggregated = result[1];
    var checkedCounts = {};
    checkedCounts.total = aggregated.reduce(function(sum, group) {
      return sum + (checkedCounts[group._id] = group.count);
    }, 0);
    return _.extend(revision, {
      total: checkedCounts.total,
      'UNPROCESSED': checkedCounts.UNPROCESSED || 0,
      'IS_OK': checkedCounts.IS_OK || 0,
      'IS_BUG': checkedCounts.IS_BUG || 0
    });
  });
}

function findRevisions(skip, limit, order) {
  order = parseOrderParam_(order);
  return Q.ninvoke(db.revisions.find({}, {_id: false})
      .skip(skip)
      .limit(limit || DEFAULT_LIMIT)
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

