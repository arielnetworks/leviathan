
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var path = require('path');
var capitalize = require('capitalize');



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
  // return Q.nfcall(Schema.capture.findOne.bind(Schema.capture, { revision: rid, id: cid }));
}
// function putQueryOptions(query, skip, limit, sort) {
//   query.skip(skip || 0).limit(limit || 20).sort(sort || {'id': -1});
// }
function upsertRevision(id, data) {
  data = data || {};
  return Q.ninvoke(models.revision, 'findOne', {where: { id: id } })
  .then(function(r) {
    if (r) {
      return Q.ninvoke(r, 'updateAttributes', data)
    } else {
      data['id'] = id;
      return Q.ninvoke(models.revision, 'create', data);
    }
  });
}
function upsertCapture(rid, cid, data) {
  // TODO: implement "upsertManulaly" function and share it
  data = data || {};
  data['id'] = cid;
  data['revision'] = rid;
  if (isTesting) {
    data['time'] = 0.1;
  }
  return Q.ninvoke(models.capture, 'findOne', {where: { id: cid, revision: rid } })
  .then(function(c) {
    if (c) {
      return Q.ninvoke(r, 'updateAttributes', data);
    } else {
      return Q.ninvoke(models.capture, 'create', data);
    }
  })
}
function updateCapture(rid, cid, data) {
  return Q.nfcall(Schema.capture.update.bind(Schema.capture, { id: cid, revision: rid }, {
    '$set': data
  }))
  .then(function(numUpdated) {
    // Returning numUpdated.
    if (global.configure.MONGODB) {
      return arguments[0][0];
    }
    return numUpdated; // nedb is a bad guy.
  });
}

if (!module.exports.ready) {
  console.log('export "ready" as a promise');
  process.exit(1);
}
