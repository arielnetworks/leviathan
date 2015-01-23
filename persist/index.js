
var Q = require('q');
Q.longStackSupport = true;
var Mongo = require('poseidon-mongo');
var Driver = Mongo.Driver;
var Database = Mongo.Database;
var assert = require('assert');
var _ = require('underscore');
var isTesting = process.env.NODE_ENV == 'test';

// TODO: Use Global Configuration
Driver.configure('test', { hosts: ['127.0.0.1:27017'], database: 'ttt', options: { w: 1 } });
var dbConnected = new Database('test');

var fetchedRevisions = dbConnected.collection('revisions');
var fetchedReports = dbConnected.collection('reports');
var fetchedCaptures = dbConnected.collection('captures');



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findReports = findReports;
module.exports.findReport = findReport;
module.exports.findCaptures = findCaptures;
module.exports.findOrCreateCapture = findOrCreateCapture;
module.exports.updateRevision = updateRevision;
module.exports.updateReport = updateReport;
module.exports.updateCapture = updateCapture;
module.exports.cleanup = cleanup;
module.exports._destroy = _destroy;



function _destroy() {
  return Q.all([fetchedRevisions, fetchedReports, fetchedCaptures].map(function(fetched) {
    return fetched.then(function(collection) {
      return collection.count().then(function(num) { // need to count before dropping
        if (num > 0) return collection.drop();
      })
    })
  }));
}

function cleanup() {
  return dbConnected.close();
}

function findOrCreateCapture(cid, report) {
  var query = {id: cid};
  return fetchedCaptures.then(function(collection) {
    return collection.findOne(query, {_id: false})
    .then(function(capture) {
      if (capture) return capture;
      return collection.update(query, {
        id: report.capture,
        expectedRevision: [report.revision],
        capture: report.capture,
        // captureName: report.captureName,
        updatedAt: isTesting ? new Date('1970-01-01T00:00:00.000Z') : undefined,
        updatedBy: 'system'
      }, {upsert: true})
      .then(function() {
        return collection.findOne(query)
      })
    })
  });
}

function updateCapture(cid, expectedRevision) {
  var capture = extractCaptureIdFromCid(cid);
  return fetchedCaptures.then(function(collection) {
    return collection.update({id: capture}, {$addToSet: {expectedRevision: expectedRevision}}, {upsert: false})
    .then(function() {
      return collection.findOne({id: capture})
    })
  })
}

function extractCaptureIdFromCid(cid) {
  return cid.split(':')[3];
}
(function testExtractCaptureIdFromCid() {
  var capture1 = extractCaptureIdFromCid('revision:1:capture:9018988ae55e012e437aa24cbf9a400a');
  assert.equal(capture1, '9018988ae55e012e437aa24cbf9a400a');
  var capture2 = extractCaptureIdFromCid('revision:oiuooiu97979:capture:9018988ae55e012e437aa24cbf9a400a');
  assert.equal(capture2, '9018988ae55e012e437aa24cbf9a400a');
})();

function updateReport(rid, cid, data) {
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return fetchedReports.then(function(collection) {
    return collection.update({id: cid, revision: rid}, {$set: data}, {upsert: true})
    .then(function() {
      return collection.findOne({id: cid}, {_id: false})
    })
  })
}

function findCaptures(skip, limit, order) {
  order = parseOrderParam_(order);
  return fetchedCaptures.then(function(collection) {
    return collection.find({}, {_id: false})
        .skip(skip || 0).limit(limit || 20).sort(order.of || 'updatedAt', order.by || -1).toArray();
  });
}

function findReport(rid, cid) {
  return fetchedReports.then(function(collection) {
    return collection.findOne({id: cid}, {_id: false})
  });
}

function findReports(rid, skip, limit, order, status, checkedAs) {
  var where = { revision: rid };
  var order = parseOrderParam_(order);
  if (status) where.status = status;
  if (checkedAs) where.checkedAs = checkedAs;
  return fetchedReports.then(function(reports) {
    return reports.find(where, {_id: false})
        .skip(skip || 0).limit(limit || 20).sort(order.of || 'id', order.by || -1).toArray();
  });
}

function updateRevision(id) {
  var data = { id: id };
  if (isTesting) { data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z') }
  return fetchedReports.then(function(collection) {
    return Q.all([
      collection.count({ revision: id, checkedAs: 'UNPROCESSED' }),
      collection.count({ revision: id, checkedAs: 'IS_OK' }),
      collection.count({ revision: id, checkedAs: 'IS_BUG' })
    ])
  })
  .then(function(counts) {
    return fetchedRevisions.then(function(collection) {
      data = _.extend(data, {
        total: counts.reduce(function(total, c) { return total + c }, 0),
        'UNPROCESSED': counts[0],
        'IS_OK': counts[1],
        'IS_BUG': counts[2],
      });
      return collection.update({id: id}, {$set: data}, {upsert: true})
      .then(function() {
        return collection.findOne({id: id})
      })
    });
  });
}

function findRevision(id) {
  return fetchedRevisions.then(function(collection) {
    return collection.findOne({id: id}, {_id: false})
  });
}

function findRevisions(skip, limit, order) {
  order = parseOrderParam_(order);
  return fetchedRevisions.then(function(collection) {
    return collection.find({}, {_id: false})
        .skip(skip).limit(limit).sort(order.of || 'id', order.by || -1).toArray();
  });
}

function parseOrderParam_(order) {
  if (!_.isString(order)) return {}
  if (!~order.indexOf(' ')) return {}
  var splitted = {};
  if ((splitted = order.split(' ')).length != 2) return {}
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
})()
