
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
module.exports.upsertReport = upsertReport;
// module.exports.updateReport = updateReport;
// module.exports.updateCapture = updateCapture;
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
        id: report.id,
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

// function updateCapture(cid, expectedRevision) {
//   return fetchedCaptures.then(function(collection) {
//     return collection.update({id: cid}, {$set: {expectedRevision: expectedRevision}}, {upsert: true})
//     .then(function() {
//       return collection.findOne({id: cid})
//     })
//   })
// }

function findCaptures(skip, limit, order) {
  return fetchedCaptures.then(function(collection) {
    return collection.find({}, {_id: false})
        .skip(skip).limit(limit).sort('updatedAt', -1).toArray();
  });
}

function upsertReport(rid, cid, data) {
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return fetchedReports.then(function(collection) {
    return collection.update({id: cid, revision: rid}, {$set: data}, {upsert: true})
    .then(function() {
      return collection.findOne({id: cid})
    })
  })
}

function findReport(rid, cid) {
  return fetchedReports.then(function(collection) {
    return collection.findOne({id: cid}, {_id: false})
  });
}

function findReports(rid, skip, limit, order, status, checkedAs) {
  var where = { revision: rid };
  if (status) where.status = status;
  if (checkedAs) where.checkedAs = checkedAs;
  return fetchedReports.then(function(reports) {
    return reports.find(where, {_id: false}).toArray();
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
  return fetchedRevisions.then(function(collection) {
    return collection.find({}, {_id: false})
        .skip(skip).limit(limit).sort('id', -1).toArray();
  });
}

