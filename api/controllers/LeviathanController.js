
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
    var revision = req.param('id');
    getDirectories(new TidalWaveContext(+revision))
    .then(processMock)
    .then(function(context) {
      res.json(context);
    })
    .fail(function(err) {
      res.json({
        error: err
      })
    });
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
  .then(function () {
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

/**
 * TODO:
 * @param {TidalWaveContext} context
 */
function processMock(context) {
  return Q().delay(800).then(function() {
    context.differences = {
      3: {},
      6: {},
      9: {}
    };
    return context;
  });
}

/**
 * @constructor
 */
function TidalWaveContext(revision) {
  this.revision = revision;
  this.olderPath =
  this.newerPath =
  this.differences = undefined;
  Object.seal(this);
}

