

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

  t.on('data', upsertReport.bind(null, rid));
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

function upsertReport(rid, data) {
  // As a relative path from baseImageDir.
  data['expect_image'] = Path.relative(global.configure.baseImageDir, data['expect_image']);
  data['target_image'] = Path.relative(global.configure.baseImageDir, data['target_image']);

  var capture = Path.relative(global.configure.relativeExpectedDir, data['expect_image']);
  var cid = 'revision:' + rid + ':capture:' + capture;

  data['id'] = cid;
  data['capture'] = generateHash(capture);
  data['revision'] = rid;
  return persist.upsertReport(rid, cid, data);
}

function generateHash(seed) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(seed);
  return md5sum.digest('hex');
}
