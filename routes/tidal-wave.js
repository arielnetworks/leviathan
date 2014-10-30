

var PostTidalWave = {};
module.exports['post'] = PostTidalWave;



PostTidalWave[':id'] = function(req, res) {
  res.json('yeah' + req.param('id'));
};

