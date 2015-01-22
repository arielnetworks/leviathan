

var Path = require('path');
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var TidalWave = require('tidal-wave');
var persist = require('../persist/mongodb');

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  var rid = req.param('id');
  var result;
  collectCaptures(rid)
  .then(function(tidalWaveReport) {
    persist.updateRevision(rid); // Without waiting.
    return tidalWaveReport;
  })
  .then(res.json.bind(res))
  .catch (function(error) {
    res.json({error: true, reason: error.stack});
  });
};



function collectCaptures(rid) {
  var d = Q.defer();

  var targetDir = getRevisionDir(rid);
  var t = TidalWave.create(targetDir, {
    getExpectedPath: function(shortPath) {
      var cid = generateHash(shortPath);
      return persist.findOrCreateCapture(cid, {
        id: cid,
        capture: cid,
        revision: rid
      })
      .then(function(capture) {
        if (capture.expectedRevision != null && capture.expectedRevision.length) {
          return Path.resolve(getRevisionDir(_.last(capture.expectedRevision)), shortPath);
        }
        // Looks like it's the first time to run tidal-wave
        return Path.resolve(targetDir, shortPath);
      });
    }
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

function upsertReport(rid, data) {
  var captureName = Path.relative(getRevisionDir(rid), data['target_image']);

  // As a relative path from baseImageDir.
  data['expect_image'] = Path.relative(global.configure.baseImageDir, data['expect_image']);
  data['target_image'] = Path.relative(global.configure.baseImageDir, data['target_image']);

  var capture = generateHash(captureName);
  var cid = 'revision:' + rid + ':capture:' + capture;

  data['id'] = cid;
  data['capture'] = capture;
  data['captureName'] = captureName;
  data['revision'] = rid;
  return persist.upsertReport(rid, cid, data);
}

function generateHash(seed) {
  var md5sum = require('crypto').createHash('md5');
  md5sum.update(seed);
  return md5sum.digest('hex');
}

function getRevisionDir(revisionId) {
  return Path.resolve(global.configure.baseImageDir,
      (global.configure.relativeTargetDirPrefix || '') + revisionId);
}
