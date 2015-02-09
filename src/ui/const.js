
var ReportedAs = ['OK', 'SUSPICIOUS', 'ERROR'];

var StatusClassNameMap = {
  'OK': 'info',
  'SUSPICIOUS': 'warning',
  'ERROR': 'danger'
};

var CheckedAs = {
  UNPROCESSED: 'UNPROCESSED',
  IS_OK: 'IS_OK',
  IS_BUG: 'IS_BUG'
};

var CheckedAsClassNameMap = {
  'UNPROCESSED': 'default',
  'IS_OK': 'success',
  'IS_BUG': 'danger'
};

var Actions = {
  CHECKAS: 'checkas'
};

module.exports = {
  ReportedAs,
  StatusClassNameMap,
  CheckedAs,
  CheckedAsClassNameMap,
  Actions
};
