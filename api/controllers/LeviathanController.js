
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
    // .then(leviathan.tidalwave)
    .then(tidalwaveMock)
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
  var older = resolvePath(context.id - 1);
  var newer = resolvePath(context.id);

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

function tidalwaveMock(context) {
  return Q().delay(800).then(function() {
    context.differences = [
      [
        {
          "x": 540,
          "y": 1030,
          "dx": -4.523705959320068,
          "dy": -9.316584587097168
        },
        {
          "x": 20,
          "y": 1040,
          "dx": -0.28951311111450195,
          "dy": -12.287890434265137
        },
        {
          "x": 30,
          "y": 1040,
          "dx": -2.0693295001983643,
          "dy": -10.873414039611816
        },
        {
          "x": 40,
          "y": 1040,
          "dx": -4.971932888031006,
          "dy": -10.790426254272461
        }
      ]
    ];
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
  setDataDescriptor(this, [
    {name: 'id', value: revision},
    {name: 'hints', value: hints},
    {name: 'olderPath', writable: true },
    {name: 'newerPath', writable: true },
    {name: 'differences', writable: true },
    {name: 'differenceIds', writable: true }
  ]);
}

function setDataDescriptor(target, properties) {
  for (var i = 0, p = properties[i]; i < properties.length; p = properties[++i]) {
    Object.defineProperty(target, p.name, p);
  }
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
    };
  })
  return json;
};
