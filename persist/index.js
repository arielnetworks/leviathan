
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var path = require('path');



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findCaptures = findCaptures;
module.exports.findCapture = findCapture;
module.exports.upsertRevision = upsertRevision;
module.exports.upsertCapture = upsertCapture;
module.exports.updateCapture = updateCapture;



var isTesting = process.env.NODE_ENV == 'test';
var jugglingdb = require('jugglingdb');
var SchemaNames = ['revision', 'capture'];
var models = {};

module.exports.ready = function() {
  var deferred = Q.defer();

  var schema = new jugglingdb.Schema(global.configure.db.type || 'memory');
  schema.on('connected', deferred.resolve.bind(deferred));
  _.each(SchemaNames, function(name) {
    // TODO: use capitalise
    models[name] = schema.define(name, require('./' + name));
  });

  return deferred.promise;
};



function findRevisions(skip, limit, sort) {
  // TODO: skip, limit, sort
  return Q.ninvoke(models.revision, 'all');
}
function findRevision(id) {
  return Q.ninvoke(models.revision, 'findOne', { where: { id: id } });
}
function findCaptures(rid, skip, limit, sort) {
  return Q.ninvoke(models.capture, 'all', {
    where: {
      revision: rid
    },
    order: 'updatedAt DESC'
  });
  // var query = Schema.capture.find({ revision: rid });
  // putQueryOptions(query, skip, limit, sort);
  // query.skip(skip || 0).limit(limit || 20).sort(sort || {});
  // return Q.ninvoke(query, 'exec');
}
function findCapture(rid, cid) {
  return Q.ninvoke(models.capture, 'findOne', { where: {
    id: cid,
    revision: rid
  } });
}
// function putQueryOptions(query, skip, limit, sort) {
//   query.skip(skip || 0).limit(limit || 20).sort(sort || {'id': -1});
// }
function upsertRevision(id, data) {
  if (isTesting) {
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return upsertManually_(models.revision, { id: id }, data);
}
function upsertCapture(rid, cid, data) {
  if (isTesting) {
    data['time'] = 0.1;
    data['updatedAt'] = new Date('1970-01-01T00:00:00.000Z');
  }
  return upsertManually_(models.capture, { id: cid, revision: rid }, data);
}
function updateCapture(rid, cid, data) {
  return findCapture(rid, cid)
  .then(function(doc) {
    if (doc) {
      return Q.ninvoke(doc, 'updateAttributes', data);
    }
  });
}

function upsertManually_(model, condition, data) {
  return Q.ninvoke(model, 'findOne', { where: condition })
  .then(function(doc) {
    return doc ?
        Q.ninvoke(doc, 'updateAttributes', data) :
        Q.ninvoke(model, 'create', data);
  });
}

if (!module.exports.ready) {
  console.log('export "ready" as a promise');
  process.exit(1);
}
