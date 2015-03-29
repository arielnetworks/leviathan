
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');
var _ = require('underscore');
var isTesting = process.env.NODE_ENV === 'test';



var collectionNames = ['revisions', 'captures'];
var db = require('mongoskin').db(global.configure.mongodb, {'native_parser': true, options: { w: 1 }});
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
  return Q.ninvoke(db.captures.find({
    capture: capture,
    revisionAt: {$lt: revisionAt}
  }, {_id: false}).sort('revisionAt', -1).limit(1), 'toArray').get(0);
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
    data.time = 0.1;
    data.updatedAt = new Date('1970-01-01T00:00:00.000Z');
  }
  return Q.ninvoke(db.captures, 'update',
      query,
      {$set: data},
      {upsert: true})
  .then(function() {
    // TODO: We dont' need to "findeOne" here! api/revisions.js has "buildCapture" method so we we should use it
    return Q.ninvoke(db.captures, 'findOne', query, {_id: false});
  });
}

// TODO: return "meta" and "items"
function findCaptures(page) {
  var skip = page > 0 ? (page - 1) * DEFAULT_LIMIT : 0;
  return Q.ninvoke(db.captures, 'aggregate', [
    {$match: {checkedAs: 'IS_OK'}},
    {$group: {
      _id: '$capture',
      updatedAt: {$max: '$updatedAt'},
      updatedBy: {$last: '$updatedBy'},
      expectedRevisions: { $push: '$revision' } } },
    {$sort: {_id: -1}},
    {$skip: skip || 0},
    {$limit: DEFAULT_LIMIT || DEFAULT_LIMIT}
  ]);
}

function findSiblingRevisionCaptureOf(rid, capture, direction) {
  return Q.ninvoke(
      db.captures.find({
        revision: rid,
        capture: direction > 0 ? {$gt: capture} : {$lt: capture},
        checkedAs: 'UNPROCESSED',
        status: {$ne: 'OK'}
      }, {_id: false})
      .sort({'captureName': 1}).limit(1),
  'toArray').then(function(docs) {
    return docs ? docs[0] : null;
  });
}

function findRevisionCapture(rid, capture) {
  return Q.ninvoke(db.captures, 'findOne', {revision: rid, capture: capture}, {_id: false});
}

function findRevisionCaptures(rid, page, order, status, checkedAs) {
  var skip = page > 0 ? (page - 1) * DEFAULT_LIMIT : 0;
  var query = { revision: rid };
  order = parseOrderParam_(order);
  if (status) query.status = status;
  if (checkedAs) query.checkedAs = checkedAs;
  var cursor = db.captures.find(query, {_id: false});
  return Q.all([
    Q.ninvoke(cursor, 'count'),
    Q.ninvoke(cursor
      .skip(skip)
      .limit(DEFAULT_LIMIT)
      .sort(order.by || 'captureName', order.in || 1)
    , 'toArray')
  ])
  .then(function(results) {
    var total = results[0];
    var items = results[1];
    return {
      meta: {
        skip: skip,
        limit: DEFAULT_LIMIT,
        total: total
      },
      items: items
    };
  });
}

function upsertRevision(id, revisionAt) {
  var data = { id: id };
  if (revisionAt) data.revisionAt = revisionAt;
  if (isTesting) data.updatedAt = new Date('1970-01-01T00:00:00.000Z');
  return Q.ninvoke(db.revisions, 'update', {id: id}, {$set: data}, {upsert: true})
  .then(findRevision.bind(null, id));
}

function findRevision(id) {
  return Q.all([
    Q.ninvoke(db.revisions, 'findOne', {id: id}, {_id: false}),
    // TODO: Use mapReduce instead of calling "aggregate" multiple times
    Q.ninvoke(db.captures, 'aggregate',
      {$match: {revision: id}},
      {$group: {
        _id: '$checkedAs',
        count: {$sum: 1} }}),
    Q.ninvoke(db.captures, 'aggregate',
      {$match: {revision: id}},
      {$group: {
        _id: '$status',
        count: {$sum: 1} }}),
    Q.ninvoke(db.captures, 'count', {
      revision: id,
      checkedAs: 'UNPROCESSED',
      status: {$ne: 'OK'}
    })
  ])
  .then(function(result) {
    var revision = result[0];
    var checkedAs = result[1];
    var reportedAs = result[2];
    var needToProcessCount = result[3];

    var total = checkedAs.reduce(function(sum, doc) { return sum + doc.count;}, 0);
    var checkedAsExpaned = expandCountFromAggregatedDocuments_(checkedAs);
    var reportedAsExpanded = expandCountFromAggregatedDocuments_(reportedAs);

    return _.extend(revision, {
      total: total,
      checkedAs: {
        'UNPROCESSED': checkedAsExpaned.UNPROCESSED || 0,
        'IS_OK': checkedAsExpaned.IS_OK || 0,
        'IS_BUG': checkedAsExpaned.IS_BUG || 0
      },
      reportedAs: {
        'OK': reportedAsExpanded.OK || 0,
        'SUSPICIOUS': reportedAsExpanded.SUSPICIOUS || 0,
        'ERROR': reportedAsExpanded.ERROR || 0
      },
      'UNPROCESSED && !OK': needToProcessCount
    });
  });
}

function expandCountFromAggregatedDocuments_(aggregated) {
  var rv = {};
  aggregated.forEach(function(doc) {
    rv[doc._id] = doc.count != null ? doc.count : 0;
  });
  return rv;
}

function findRevisions(page, order) {
  var skip = +page > 0 ? (+page - 1) * DEFAULT_LIMIT : 0;
  order = !order ? [['revisionAt', 'descending']] :
      _.isString(order) ? [order.split(':')] :
      order.map(function(p) { return p.split(':') });
  var cursor = db.revisions.find({}, {_id: false});
  return Q.all([
    Q.ninvoke(cursor, 'count'),
    Q.ninvoke(cursor
      .skip(skip)
      .limit(DEFAULT_LIMIT)
      .sort(order)
    , 'toArray')
  ]).then(function(result) {
    var total = result[0];
    var items = result[1];
    return Q.all(items.map(function(item) {
      // XXX: Expensive. Better idea?
      return findRevision(item.id);
    }))
    .then(function(results) {
      return {
        meta: {
          skip: skip,
          limit: DEFAULT_LIMIT,
          total: total
        },
        items: results
      };
    });
  });
}

function parseOrderParam_(order) {
  if (!_.isString(order)) return {};
  if (!~order.indexOf(' ')) return {};
  var splitted = {};
  if ((splitted = order.split(' ')).length !== 2) return {};
  return {
    by: splitted[0],
    in: splitted[1] === 'ASC' ? 1 : -1
  };
}
if (isTesting) {
  (function testParseOrderParam_() {
    var order1 = parseOrderParam_('id ASC');
    assert.equal(order1.by, 'id');
    assert.equal(order1.in, 1);
    var order2 = parseOrderParam_('updatedAt DESC');
    assert.equal(order2.by, 'updatedAt');
    assert.equal(order2.in, -1);
  })();
}
