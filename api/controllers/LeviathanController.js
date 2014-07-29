
var leviathan = require('../services/leviathan.js');

/*
 * Assume there is a directory like this:
 * ./captures
 *   - revision1
 *     - capture1.png
 *     - capture2.png
 *     - capture3.png
 *   - revision2
 *     - capture1.png
 *     - capture2.png
 *     - capture3.png
 *   - revision3
 *     - capture1.png
 *     - capture2.png
 *     - capture3.png
 *
 */

var CAPTURES_DIR = './resource/capture';
var REVISION_PREFIX = 'revision:';



module.exports = {
  tidalwave: function(req, res) {
    req.socket.emit('progress-message', { message: 'リヴァイアサンしてます...' });
    Q(new TidalwaveContext(+req.param('id') || 3, [
      { 'expect_image': 'customjsp1.png', 'target_image': 'customjsp2.png' },
      { 'expect_image': 'tsucuba_left.png', 'target_image': 'tsucuba_right.png' }
    ]))
    .then(leviathan.tidalwave)
    .then(function(rv) {
      req.socket.emit('progress-message', { message: '保存しています...' });
      return rv;
    })
    .then(leviathan.store)
    .then(function(rv) {
      req.socket.emit('progress-message', { message: '保存しました', end: true });
      return rv;
    })
    .catch(function(err) {
      req.socket.emit('progress-message', { message: '失敗しました', end: true, error: true });
      console.log(err.stack);
      throw new Error;
      return {error: err};
    })
    .done(function(context) {
      res.json(context.toData());
    })
  },
  _config: {}
};





function getDirectories(context) {
  var older = resolvePath(context.revision - 1);
  var newer = resolvePath(context.revision);

  return Q.all([
    fs.exists(older),
    fs.exists(newer)
  ])
  .then(allExists)
  .then(function() {
    context.newerPath = newer;
    context.olderPath = older;
    return context;
  });
}

function allExists(arr) {
  if (_.every(arr)) return;
  throw new Error('directory does not exist');
}

function resolvePath(revision) {
  if (_.isNumber(revision) && revision < 0) {
    return '';
  }
  return path.resolve(CAPTURES_DIR, REVISION_PREFIX + revision);
}

function processMock(context) {
  return Q().delay(800).then(function() {
    context.differences = {};
    for (var i = 0; i < random(8) + 1; i++)
      context.differences[random(16)] = {};
    return context;
  });
}

function random(lessThan) {
  return Math.floor(Math.random() * lessThan);
}



/**
 * @constructor
 */
function TidalwaveContext(revision, hints) {
  this.id = this.revision = revision;
  this.hints = hints;
  this.olderPath = undefined;
  this.newerPath = undefined;
  this.differences = undefined;
  this.differenceIds = undefined;
  Object.seal(this);
}

TidalwaveContext.JsonKeys = [
  'id', 'hints', 'olderPath', 'newerPath', 'differenceIds'
];

TidalwaveContext.prototype.toData = function () {
  var that = this;
  var json = {};
  TidalwaveContext.JsonKeys.forEach(function(key) {
    if (that[key]) {
      json[key] = that[key];
    }
  })
  return json;
};
