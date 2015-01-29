

var Path = require('path');
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var TidalWave = require('tidal-wave');
var persist = require('../persist');

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  var rid = req.param('id');
  var revisionAt = req.param('revisionAt');
  Q().then(function() {
    if (!revisionAt) throw new Error('Specify "revisionAt" which refers to a datetime of the commit');
    revisionAt = new Date(revisionAt);
    return Q.all([
      collectCaptures(rid, revisionAt),
      persist.upsertRevision(rid, revisionAt)
    ]);
  })
  .then(function(result) {
    var tidalWaveReport = result[0];
    return tidalWaveReport;
  })
  .then(res.json.bind(res))
  .catch (function(error) {
    res.json({error: true, reason: error.stack});
  });
};



function collectCaptures(rid, revisionAt) {
  var d = Q.defer();

  var targetDir = getRevisionDir(rid);
  var t = TidalWave.create(targetDir, {
    getExpectedPath: function(shortPath) {
      var capture = generateHash(shortPath);
      return persist.findOrCreateCapture(capture, rid)
      .then(function(capture) {
        if (capture.expectedRevision != null && capture.expectedRevision.length) {
          return Path.resolve(getRevisionDir(_.last(capture.expectedRevision)), shortPath);
        }
        // Looks like it's the first time to run tidal-wave
        return Path.resolve(targetDir, shortPath);
      });
    }
  });

  t.on('data', insertReport.bind(null, rid, revisionAt));
  t.once('error', d.reject);
  t.once('finish', d.resolve);
  t.once('error', cleanup);
  t.once('finish', cleanup);

  return d.promise;

  function cleanup() {
    t = null;
  }
}

function insertReport(rid, revisionAt, data) {
  var captureName = Path.relative(getRevisionDir(rid), data['target_image']);

  // As a relative path from baseImageDir.
  data['expect_image'] = Path.relative(global.configure.baseImageDir, data['expect_image']);
  data['target_image'] = Path.relative(global.configure.baseImageDir, data['target_image']);

  var capture = generateHash(captureName);

  data['capture'] = capture;
  data['captureName'] = captureName;
  data['revision'] = rid;
  data['checkedAs'] = 'UNPROCESSED';
  data['revisionAt'] = revisionAt;
  return persist.insertReport(rid, capture, data);
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
