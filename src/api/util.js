
module.exports.putResolvedValue = putResolvedValue;
module.exports.putRejectedReason = putRejectedReason;

function putResolvedValue(req) {
  return function(value) {
    req['@resolvedValue'] = value;
  };
}

function putRejectedReason(req) {
  return function(reason) {
    req['@rejectedReason'] = reason;
  };
}
