
var _ = require('underscore');
var Q = require('q');



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findCaptures = findCaptures;
module.exports.findCapture = findCapture;
module.exports.upsertRevision = upsertRevision;
module.exports.upsertCapture = upsertCapture;



var Schema = {};

if (global.configure.USE_MONGO) {
  var mongoose = require('mongoose');

  // Establish mongodb connection
  mongoose.connect('mongodb://localhost/leviathan');
  var connection = module.exports.connection = mongoose.connection;
  connection.on('error', console.error.bind(console, '***connection error:'));
  ['revision', 'capture'].forEach(function(name) {
    Schema[name] = require('./' + name)(mongoose);
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
