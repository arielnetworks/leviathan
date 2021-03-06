
var ReportedAs = ['OK', 'SUSPICIOUS', 'ERROR'];

var Status = {
  OK: 'OK',
  SUSPICIOUS: 'SUSPICIOUS',
  ERROR: 'ERROR'
};

var StatusClassNameMap = {
  OK: 'info',
  SUSPICIOUS: 'warning',
  ERROR: 'danger'
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

var ToggleCheckedAsOrder = [CheckedAs.IS_OK, // UP
             CheckedAs.UNPROCESSED,
             CheckedAs.IS_BUG]; // DOWN

var PER_PAGE = 20;

module.exports = {
  ReportedAs,
  Status,
  StatusClassNameMap,
  CheckedAs,
  CheckedAsClassNameMap,
  Actions,
  ToggleCheckedAsOrder,
  PER_PAGE
};
