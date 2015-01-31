
var Q = require('q');
var xhr = require('xhr');
var QueryString = require('querystring');



module.exports = get;
module.exports.get = get;
module.exports.post = post;



function get(uri) {
  return Q.nfcall(xhr, uri)
  .then(_parseAsJson)
};

function post(uri, content) {
  return Q.nfcall({
    uri: uri,
    method: 'POST',
    body: QueryString.stringify(content)
  }, uri)
  .then(_parseAsJson)
};

function _parseAsJson(result) {
  var res = result[0];
  var body = result[1];
  return JSON.parse(body);
}
