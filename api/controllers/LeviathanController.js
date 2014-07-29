
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
    Q(new TidalwaveContext(+req.param('id') || 3, [
      { 'expect_image': 'customjsp1.png', 'target_image': 'customjsp2.png' },
      { 'expect_image': 'tsucuba_left.png', 'target_image': 'tsucuba_right.png' }
    ]))
    .then(leviathan.tidalwave)
    .then(leviathan.store)
    .catch(function(err) {
      console.log(err.stack);
      throw new Error;
      return {error: err};
    })
    .done(function(context) {
      res.json(context.toJson());
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
  this.olderPath =
  this.newerPath =
  this.differences =
  this.differenceIds = undefined;
  Object.seal(this);
}

TidalwaveContext.prototype.toJson = function () {
  var json = _.extend({}, this);
  delete json.differences;
  return json;
};
