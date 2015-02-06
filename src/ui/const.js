
var ReportedAs = [ 'OK', 'SUSPICIOUS', 'ERROR' ];

var StatusClassNameMap = {
  'OK': 'info',
  'SUSPICIOUS': 'warning',
  'ERROR': 'danger'
};

var CheckedAs = [ 'UNPROCESSED', 'IS_OK', 'IS_BUG' ];

var CheckedAsClassNameMap = {
  'UNPROCESSED': 'info',
  'IS_OK': 'success',
  'IS_BUG': 'danger'
};

module.exports = {
  ReportedAs,
  StatusClassNameMap,
  CheckedAs,
  CheckedAsClassNameMap
};
