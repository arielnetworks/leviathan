
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



module.exports.ready; /* Export promise fulfilled when a database get ready. */
var Schema = {};
var SchemaNames = ['revision', 'capture'];

if (!!global.configure.MONGODB) {
  var deferredConnection = Q.defer();
  module.exports.ready = deferredConnection.promise;
  var mongoose = require('mongoose');

  // Establish mongodb connection
  mongoose.connect(global.configure.MONGODB);
  mongoose.connection.on('error', deferredConnection.reject.bind(deferredConnection));
  mongoose.connection.on('open', function() {
    console.log('Ready to use mongodb.');
    deferredConnection.resolve();
  });
  SchemaNames.forEach(function(name) {
    var schema = require('./' + name);
    Schema[name] = mongoose.model(name, mongoose.Schema(schema));
  });

} else {
  var Datastore = require('nedb');
  module.exports.ready = Q.all(SchemaNames.map(function(name) {
    // TODO
    return Q.fcall(function() {
      var db = Schema[name] = new Datastore(path.join(global.configure.NEDB, name + '.db'));
      return Q.ninvoke(db, 'loadDatabase');
    })
  }))
  .then(function() {
    console.log('Ready to use nedb.');
  })
}



function findRevisions(skip, limit, sort) {
  var query = Schema.revision.find();
  putQueryOptions(query, skip, limit, sort);
  return Q.ninvoke(query, 'exec');
}
function findRevision(id) {
  return Q.nfcall(Schema.revision.findOne.bind(Schema.revision, {id: id}))
}
function findCaptures(rid, skip, limit, sort) {
  var query = Schema.capture.find({ revision: rid })
  putQueryOptions(query, skip, limit, sort);
  query.skip(skip || 0).limit(limit || 20).sort(sort || {});
  return Q.ninvoke(query, 'exec');
}
function findCapture(rid, cid) {
  return Q.nfcall(Schema.capture.findOne.bind(Schema.capture, { revision: rid, id: cid }));
}
function putQueryOptions(query, skip, limit, sort) {
  query.skip(skip || 0).limit(limit || 20).sort(sort || {'id': -1});
}
function upsertRevision(id, data) {
  return Q.nfcall(Schema.revision.update.bind(Schema.revision, { id: id }, _.extend({
    id: id,
    updatedAt: new Date(),
    // XXX: nedb cannot use "$setOnInsert"
    // $setOnInsert: { createdAt: new Date() }
  }, data || {}), { upsert: true }));
}
function upsertCapture(rid, cid, data) {
  return Q.nfcall(Schema.capture.update.bind(Schema.capture, { id: cid }, _.extend({
    id: cid,
    revision: rid,
    updatedAt: new Date(),
    // XXX: nedb cannot use "$setOnInsert"
    // $setOnInsert: { createdAt: new Date() }
  }, data), { upsert: true }));
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
