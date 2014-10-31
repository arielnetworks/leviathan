

var _ = require('underscore');
var Q = require('q');
var TidalWave = require('../tidal-wave-wrap');
var Schema = require('../persistent').Schema;
var persistent = require('../persistent');

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  var rid = req.param('id');
  Q.all([
    persistent.upsertRevision(rid),
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
  t.on('message', insertCapture.bind(null, rid));
  t.on('error', d.reject);
  t.on('finish', d.resolve); // Pass report
  return d.promise;
}

function insertCapture(rid, data) {
  // TODO:
  var captureName = data['expect_image'].match(/(?:expected\/)(.*)/)[1];
  var cname = generateHash(captureName);
  var cid = 'revision:' + rid + ':capture:' + cname;

  return persistent.upsertCapture(rid, cid, _.extend(data, {
    capture: cname,
    captureName: captureName,
  }));
}

function generateHash(seed) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(seed);
  return md5sum.digest('hex');
}
