
module.exports.putResolvedValue = putResolvedValue;
module.exports.putRejectedReason = putRejectedReason;
module.exports.handleAsJSONResponse = handleAsJSONResponse;

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

function handleAsJSONResponse(req, res) {
  if (req['@rejectedReason']) {
    // TODO: status?
    return res.json({
      error: 1,
      reason: req['@rejectedReason']
    });
  }
  return res.json(req['@resolvedValue']);
}
