
var Q = require('q');
var mongoose = require('mongoose');



module.exports.findRevisions = findRevisions;
module.exports.findRevision = findRevision;
module.exports.findCaptures = findCaptures;
module.exports.findCapture = findCapture;



// Establish mongodb connection
mongoose.connect('mongodb://localhost/leviathan');
var connection = module.exports.connection = mongoose.connection;
connection.on('error', console.error.bind(console, '***connection error:'));



// Expose schemas TODO: remove exporting
var Schema = module.exports.Schema = {};
['revision', 'capture'].forEach(function(name) {
  module.exports.Schema[name] = require('./' + name)(mongoose);
});



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
