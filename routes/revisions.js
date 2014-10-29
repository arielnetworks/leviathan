
var Q = require('q');
var _ = require('underscore');

// DB Shemas
var db = require('../mongo').db;



module.exports['index'] = function(req, res) {
  Q.nfcall(db.revision.find.bind(db.revision))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

module.exports[':id'] = function(req, res) {
  Q.nfcall(db.revision.findOne.bind(db.revision, {id: req.param('id')}))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};

module.exports[':id/conflicts'] = function(req, res) {
  Q.all([
    Q.nfcall(db.revision.findOne.bind(db.revision, {id: req.param('id')})),
    Q.nfcall(db.conflict.find.bind(db.conflict, {revision: req.param('id')}))
  ])
  .then(function(results) {
    res.json({
      revision: results[0],
      conflicts: results[1]
    });
  })
  .catch (handleError.bind(null, res));
};

module.exports[':id/conflicts/:cid'] = function(req, res) {
  Q.nfcall(db.conflict.findOne.bind(db.conflict, { revision: req.param('id'), capture: req.param('cid') }))
  .then(res.json.bind(res))
  .catch (handleError.bind(null, res));
};



function handleError(res, reason) {
  res.json({
    error: 1,
    reason: reason
  });
}
