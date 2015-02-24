
var Q = require('q');
var xhr = require('xhr');



module.exports = get;
module.exports.get = get;
module.exports.post = post;



function get(uri) {
  return Q.nfcall(xhr, {
    uri,
    json: true
  })
  .get(1); // same as JSON.parse(req.body)
}

function post(uri, json) {
  return Q.nfcall(xhr, {
    uri,
    method: 'POST',
    json: json
  })
  .get(1); // same as JSON.parse(req.body)
}
