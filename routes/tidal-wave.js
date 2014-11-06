

var _ = require('underscore');
var Q = require('q');
var TidalWave = require('../tidal-wave-wrap');
var Schema = require('../persist').Schema;
var persist = require('../persist');

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  var rid = req.param('id');
  Q.all([
    upsertRevision(rid),
    collectCaptures(rid)
  ])
  .then(function(results) {
    var report = results[1];
    return report;
  })
  .then(res.json.bind(res))
  .catch (function(reason) {
    res.json({error: true, reason: reason});
  });
};



function collectCaptures(rid) {
  var d = Q.defer();
  var t = new TidalWave(rid);

  t.on('message', upsertCapture.bind(null, rid));
  t.once('error', cleanup);
  t.once('error', d.reject);
  t.once('finish', cleanup);
  t.once('finish', d.resolve);

  return d.promise;

  function cleanup() {
    t.removeAllListeners();
    delete t;
  }
}

function upsertRevision(id, data) {
  data = data || {};
  data['id'] = id;
  return persist.upsertRevision(id, data);
}

function upsertCapture(rid, data) {
  // TODO:
  var captureName = data['captureName'] = data['expect_image'].match(/(?:expected\/)(.*)/)[1];
  var cname = data['capture'] = generateHash(captureName);
  var cid = data['id'] = 'revision:' + rid + ':capture:' + cname;
  data['revision'] = rid;
  return persist.upsertCapture(rid, cid, data);
}

function generateHash(seed) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(seed);
  return md5sum.digest('hex');
}
