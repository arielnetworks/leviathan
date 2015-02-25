

var Path = require('path');
var Q = require('q');
Q.longStackSupport = true;
var TidalWave = require('tidal-wave');
var persist = require('../persist');
var ApiUtil = require('./util');

var POST = {};
module.exports.post = POST;



POST[':id'] = function(req) {
  var rid = req.params.id;
  var revisionAt = req.body && req.body.revisionAt;
  return Q().then(function() {
    if (!revisionAt) throw new Error('Specify "revisionAt" which refers to a datetime of the commit');
    revisionAt = toDate(revisionAt);
    return Q.all([
      collectCaptures(rid, revisionAt),
      persist.upsertRevision(rid, revisionAt)
    ]);
  })
  .then(function(result) {
    var tidalWaveResult = result[0];
    return tidalWaveResult;
  })
};



function collectCaptures(rid, revisionAt) {
  var d = Q.defer();

  var targetDir = getRevisionDir(rid);
  var t = TidalWave.create(targetDir, {
    getExpectedPath: function(shortPath) {
      var cid = generateHash(shortPath);
      return persist.findLastExpectedCapture(cid, revisionAt)
      .then(function(capture) {
        if (capture && capture.revision) {
          return Path.resolve(getRevisionDir(capture.revision), shortPath);
        }
        // Looks like it's the first time to run tidal-wave
        return Path.resolve(targetDir, shortPath);
      });
    }
  });

  t.on('data', insertCapture.bind(null, rid, revisionAt));
  t.once('error', d.reject);
  t.once('finish', d.resolve);
  t.once('error', cleanup);
  t.once('finish', cleanup);

  return d.promise;

  function cleanup() {
    t = null;
  }
}

function insertCapture(rid, revisionAt, data) {
  var captureName = Path.relative(getRevisionDir(rid), data['target_image']);

  // As a relative path from baseImageDir.
  data['expect_image'] = Path.relative(global.configure.baseImageDir, data['expect_image']);
  data['target_image'] = Path.relative(global.configure.baseImageDir, data['target_image']);

  var capture = generateHash(captureName);

  data.capture = capture;
  data.captureName = captureName;
  data.revision = rid;
  data.checkedAs = 'UNPROCESSED';
  data.revisionAt = revisionAt;
  return persist.insertCapture(rid, capture, data);
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

function toDate(str) {
  return new Date(isNumeric(str) ? +str : str);
}

var notNumericRegexp = /[^0-9]/;
function isNumeric(str) {
  return !notNumericRegexp.test(str);
}
