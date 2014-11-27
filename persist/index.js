
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
module.exports.upsertRevision = upsertRevision;
module.exports.upsertReport = upsertReport;
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
function findReports(rid, skip, limit, order, status, modifiedStatus) {
  var where = { revision: rid };
  if (status) where.status = status;
  if (modifiedStatus) where.modifiedStatus = modifiedStatus;
  return Q.ninvoke(models.report, 'all',
      extendParams_({ where: where }, skip, limit, order));
}
function findReport(rid, cid) {
  return Q.ninvoke(models.capture, 'find', cid);
}
// function putQueryOptions(query, skip, limit, order) {
//   query.skip(skip || 0).limit(limit || 20).order(order || {'id': -1});
// }
function upsertRevision(id, data) {
  if (isTesting) {
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return upsertManually_(models.revision, { id: id }, data);
}
function upsertReport(rid, cid, data) {
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return upsertManually_(models.report, { id: cid, revision: rid }, data);
}
function updateCapture(rid, cid, data) {
  return findReport(rid, cid)
  .then(function(doc) {
    if (doc) {
      return Q.ninvoke(doc, 'updateAttributes', data);
    }
  });
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
