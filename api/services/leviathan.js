


/**
 * Care about Revision and Difference
 */

module.exports = {

  /**
   * @param {Array.<{expect_image, target_image}>} hints
   * @return {Promise}
   */
  tidalwave: handleTidalwave,

  store: handleStore

};



var socket = require('socket.io-client')('ws://10.0.2.90:5000');



function handleTidalwave (context) {
  return context.hints.reduce(function(p, hint) {
    return p.then(function(differences) {
      return request(hint).then(function(result) {
        differences.push(result);
        return differences;
      })
    });
  }, Q([]))
  .then(function(differences) {
    context.differences = differences;
    return context;
  })
}



function handleStore(context) {
  return Difference.destroy({revision: context.id})
  .then(function() {
    return Q.all(_.map(context.differences, function (v, k) {
      if (_.isEmpty(v)) return;
      var id = Difference.generateId(context.id, k);
      return Difference.upsertById(id, {
        id: id,
        result: v
      })
      .get('id')
    })).then(_.compact)
  })
  .then(function(ids) {
    context.differenceIds = ids;
    delete context.differences;
    return Revision.upsertById(context.id, context.toData())
  })
  .then(function() {
    return context;
  })
}



function request(hint) {
  var d = Q.defer();
  socket.once('error', function (response) {
    socket.removeAllListeners();
    d.reject(response);
  });
  socket.once('message', function (response) {
    socket.removeAllListeners();
    d.resolve(response);
  });
  socket.send(_.extend({
    threshold: 10,
    span: 10
  }, hint));
  return d.promise;
}



function log(msg) {
  console.log();
  console.log('=====================' + msg + '======================');
  console.log();
}
socket.on('connect', log.bind(null, 'websocket connected!!'));
socket.on('disconnect', log.bind(null, 'websocket disconnected!!'));
socket.on('error', log.bind(null, 'websocket error occurs!!'));
