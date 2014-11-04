
var _ = require('underscore');
var Q = require('q');

// Export promise fulfilled when a database get ready.
var deferredConnection = Q.defer();
module.exports.ready = deferredConnection.promise;



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findCaptures = findCaptures;
module.exports.findCapture = findCapture;
module.exports.upsertRevision = upsertRevision;
module.exports.upsertCapture = upsertCapture;



var Schema = {};
var SchemaNames = ['revision', 'capture'];

if (!!global.configure.MONGODB) {
  var mongoose = require('mongoose');

  // Establish mongodb connection
  mongoose.connect(global.configure.MONGODB);
  mongoose.connection.on('error', deferredConnection.reject.bind(deferredConnection));
  mongoose.connection.on('open', deferredConnection.resolve.bind(deferredConnection));
  SchemaNames.forEach(function(name) {
    var schema = require('./' + name);
    Schema[name] = mongoose.model(name, mongoose.Schema(schema));
  });

} else {
  var mongoose = require('nedb');

  // Prepare nedb database
  console.log('use nedb');
}




function findRevisions(queryOption) {
  return Q.nfcall(Schema.revision.find.bind(Schema.revision,
      {}, null, queryOption));
}
function findRevision(id) {
  return Q.nfcall(Schema.revision.findOne.bind(Schema.revision, {id: id}))
}
function findCaptures(rid, queryOption) {
  return Q.nfcall(Schema.capture.find.bind(Schema.capture, { revision: rid },
        null, queryOption));
}
function findCapture(rid, cid) {
  return Q.nfcall(Schema.capture.findOne.bind(Schema.capture, { revision: rid, id: cid }));
}
function upsertRevision(id, data) {
  return Q.nfcall(Schema.revision.update.bind(Schema.revision, { id: id }, _.extend({
    id: id,
    updatedAt: new Date(),
    $setOnInsert: { createdAt: new Date() }
  }, data || {}), { upsert: true }));
}
function upsertCapture(rid, cid, data) {
  return Q.nfcall(Schema.capture.update.bind(Schema.capture, { id: cid }, _.extend({
    id: cid,
    revision: rid,
    updatedAt: new Date(),
    $setOnInsert: { createdAt: new Date() }
  }, data), { upsert: true }));
}
