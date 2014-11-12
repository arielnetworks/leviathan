

var Path = require('path');
var _ = require('underscore');
var Q = require('q');
var TidalWave = require('tidal-wave');
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
  .catch (function(error) {
    res.json({error: true, reason: error.stack});
  });
};



function collectCaptures(rid) {
  var d = Q.defer();

  var t = TidalWave.create(
      Path.resolve(global.configure.baseImageDir, global.configure.relativeExpectedDir),
      Path.resolve(global.configure.baseImageDir, (global.configure.relativeTargetDirPrefix || '') + rid), {
        span: 10,
        threshold: 5
      });

  t.on('data', upsertCapture.bind(null, rid));
  t.once('error', d.reject);
  t.once('finish', d.resolve);
  t.once('error', cleanup);
  t.once('finish', cleanup);

  return d.promise;

  function cleanup() {
    t = null;
  }
}

function upsertRevision(id, data) {
  data = data || {};
  data['id'] = id;
  return persist.upsertRevision(id, data);
}

function upsertCapture(rid, data) {
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
