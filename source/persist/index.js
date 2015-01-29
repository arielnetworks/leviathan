
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');
var _ = require('underscore');
var isTesting = process.env.NODE_ENV == 'test';



// TODO: Use Global Configuration
var collectionNames = ['revisions', 'captures'];
var db = require('mongoskin').db('mongodb://127.0.0.1:27017/ttt', {native_parser: true, options: { w: 1 }});
collectionNames.forEach(db.bind.bind(db));



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findRevisionCaptures = findRevisionCaptures;
module.exports.findRevisionCapture = findRevisionCapture;
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
    return updateCapture(rid, capture, data)
  })
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

function findCaptures(skip, limit, order) {
  return Q.ninvoke(db.captures, 'distinct', 'capture')
  .then(function(captureIds) {
    // TODO: slice
    // TODO: use Q.consume
    return Q.all(
      captureIds.map(function(id) {
        var expectedRevision;
        return Q.ninvoke(db.captures.find({capture: id, checkedAs: 'IS_OK'}, {revision: true, _id: false})
            .sort('revisionAt', 1)
        , 'toArray')
        .then(function(docs) {
          expectedRevision = docs.map(function(doc) { return doc.revision });
          return Q.ninvoke(db.captures.find({ capture: id, checkedAs: {$ne: 'UNPROCESSED'} }, {capture: true, updatedAt: true, updatedBy: true, _id: false})
              .limit(1).sort('updatedAt', -1), 'toArray').get(0)
        })
        .then(function(doc) {
          if (!doc) throw new Error('System is something wrong.');
          doc.expectedRevision = expectedRevision;
          return doc;
        })
      })
    )
  })
}

function findRevisionCapture(rid, capture) {
  return Q.ninvoke(db.captures, 'findOne', {revision: rid, capture: capture}, {_id: false});
}

function findRevisionCaptures(rid, skip, limit, order, status, checkedAs) {
  var where = { revision: rid };
  var order = parseOrderParam_(order);
  if (status) where.status = status;
  if (checkedAs) where.checkedAs = checkedAs;
  return Q.ninvoke(db.captures.find(where, {_id: false})
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
    Q.ninvoke(db.captures, 'count', { revision: id, checkedAs: 'UNPROCESSED' }),
    Q.ninvoke(db.captures, 'count', { revision: id, checkedAs: 'IS_OK' }),
    Q.ninvoke(db.captures, 'count', { revision: id, checkedAs: 'IS_BUG' })
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
