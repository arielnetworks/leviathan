
var path = require('path');
var assert = require('assert');
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var jugglingdb = require('jugglingdb');

var isTesting = process.env.NODE_ENV == 'test';
var SchemaNames = ['revision', 'capture', 'report'];
var models;



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findReports = findReports;
module.exports.findReport = findReport;
module.exports.findCaptures = findCaptures;
module.exports.findOrCreateCapture = findOrCreateCapture;
module.exports.updateRevision = updateRevision;
module.exports.upsertReport = upsertReport;
module.exports.updateReport = updateReport;
module.exports.updateCapture = updateCapture;



module.exports.ready = function() {
  var deferred = Q.defer();
  models = {};
  assert(global.configure.db.type, 'Specify "configure.db.type".');
  var schema = new jugglingdb.Schema(global.configure.db.type, global.configure.db);
  schema.on('connected', deferred.resolve.bind(deferred));
  _.each(SchemaNames, function(name) {
    models[name] = schema.define(name, require('./' + name));
  });
  return deferred.promise;
};

module.exports.cleanup = function() {
  return Q.all(
    _.map(models, function(model) {
      return Q.ninvoke(model, 'destroyAll');
    })
  ).then(function() {
    models = null;
    return undefined; // return nothing.
  });
};



function findRevisions(skip, limit, order) {
  return Q.ninvoke(models.revision, 'all',
      extendParams_({}, skip, limit, _.isString(order) ? order : 'id DESC'));
}
function findRevision(id) {
  return Q.ninvoke(models.revision, 'find', id);
}
function findReports(rid, skip, limit, order, status, checkedAs) {
  var where = { revision: rid };
  if (status) where.status = status;
  if (checkedAs) where.checkedAs = checkedAs;
  return Q.ninvoke(models.report, 'all',
      extendParams_({ where: where }, skip, limit, order));
}
function findCaptures(skip, limit, order) {
  return Q.ninvoke(models.capture, 'all',
      extendParams_({}, skip, limit, _.isString(order) ? order : 'updatedAt DESC'));
}
function findOrCreateCapture(cid, report) {
  return Q.ninvoke(models.capture, 'find', cid)
  .then(function(capture) {
    if (capture) {
      return capture;
    }
    report = report || {
      id: cid,
      capture: cid
    };
    return Q.ninvoke(models.capture, 'create', {
      id: report.id,
      expectedRevision: [report.revision],
      capture: report.capture,
      captureName: report.captureName,
      updatedAt: isTesting ? new Date('1970-01-01T00:00:00.000Z') : undefined
    })
  });
}
function findReport(rid, cid) {
  return Q.ninvoke(models.report, 'find', cid);
}

// function putQueryOptions(query, skip, limit, order) {
//   query.skip(skip || 0).limit(limit || 20).order(order || {'id': -1});
// }
function updateRevision(id) {
  var data = {
    id: id
  };
  if (isTesting) {
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return Q.all([
    Q.ninvoke(models.report, 'count', { revision: id, checkedAs: 'UNPROCESSED'}),
    Q.ninvoke(models.report, 'count', { revision: id, checkedAs: 'IS_OK'}),
    Q.ninvoke(models.report, 'count', { revision: id, checkedAs: 'IS_BUG'})
  ])
  .then(function(counts) {
    data = _.extend(data, {
      total: counts.reduce(function(total, c) { return total + c }, 0),
      'UNPROCESSED': counts[0],
      'IS_OK': counts[1],
      'IS_BUG': counts[2],
    });
    return upsertManually_(models.revision, { id: id }, data);
  });
}
function upsertReport(rid, cid, data) {
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return upsertManually_(models.report, { id: cid, revision: rid }, data);
}
function updateReport(rid, cid, data) {
  return findReport(rid, cid)
  .then(function(doc) {
    if (doc) {
      updateRevision(rid); // Without waiting.
      return Q.ninvoke(doc, 'updateAttributes', data);
    }
  });
}
function updateCapture(cid, expectedRevision) {
  return upsertManually_(models.capture,
      { id: cid }, { expectedRevision: expectedRevision }, true);
}

function upsertManually_(model, condition, data) {
  return (condition.id != null ?
      Q.ninvoke(model, 'find', condition.id) :
      Q.ninvoke(model, 'findOne', { where: condition }))
  // return Q.ninvoke(model, 'findOne', { where: condition })
  .then(function(doc) {
    return doc ?
        Q.ninvoke(doc, 'updateAttributes', data) :
        Q.ninvoke(model, 'create', data);
  });
}

function extendParams_(params, skip, limit, order) {
  params.order = _.isString(order) ? order : 'updatedAt DESC';
  if (!_.isNaN(+skip)) params.skip = +skip;
  if (!_.isNaN(+limit)) params.limit = +limit;
  return params;
}

if (!module.exports.ready) {
  console.log('export "ready" as a promise');
  process.exit(1);
}
