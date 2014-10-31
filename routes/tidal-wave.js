

var Q = require('q');
var TidalWave = require('../tidal-wave-wrap');
var db = require('../persistent').db;

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  var rid = req.param('id');
  Q.all([
    insertRevision(rid),
    collectCaptures(rid)
  ])
  .then(function(results) {
    console.log(results);
    return results[1]; // collect captures
  })
  .then(res.json.bind(res))
  .catch (function(reason) {
    res.json({error: true, reason: reason});
  });
};



function collectCaptures(rid) {
  var d = Q.defer();
  var t = new TidalWave({});
  t.on('message', insertCapture.bind(null, rid));
  t.on('error', d.reject);
  t.on('finish', d.resolve);
  return d.promise;
}

function insertRevision(rid) {
  return Q.nfcall(db.revision.update.bind(db.revision, { id: rid }, {
    id: rid,
    updated_at: new Date(),
    $setOnInsert: { created_at: new Date() }
  }, { upsert: true }));
}

function insertCapture(rid, data) {
  console.log(data);
  // TODO:
  var captureName = data['expect_image'].match(/(?:expected\/)(.*)/)[1];
  var cNameId = generateHash(captureName);
  var cid = 'revision:' + rid + ':capture:' + cNameId;

  return Q.nfcall(db.capture.update.bind(db.capture, { id: cid }, {
    id: cid,
    revision: rid,
    capture: cNameId,
    capture_name: captureName,

    status: data['status'],
    vector: data['vector'],

    updated_at: new Date(),
    $setOnInsert: { created_at: new Date() }
  }, { upsert: true }));
}

function generateHash(seed) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(seed);
  return md5sum.digest('hex');
}
