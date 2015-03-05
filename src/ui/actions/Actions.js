
var Dispatcher = require('../dispatcher/Dispatcher');
var {Actions, ToggleCheckedAsOrder} = require('../../const');
var _ = require('underscore');



module.exports = { checkAs, sort, toggleCheckedAs };



/**
 * @param {string} capture
 * @param {CheckedAs} as
 */
function checkAs(revision, capture, as) {
  Dispatcher.dispatch({
    type: Actions.CHECKAS,
    revision, capture, as
  });
}

function sort(names) {
  if (!_.isArray(names)) names = [names];
  console.log(names);
}

function toggleCheckedAs(capture, direction) {
  if (!capture) return;
  var currIndex = ToggleCheckedAsOrder.indexOf(capture.checkedAs);
  var toIndex = currIndex + direction;
  if (toIndex < 0) {
    toIndex += ToggleCheckedAsOrder.length;
  } else if (toIndex >= ToggleCheckedAsOrder.length) {
    toIndex -= ToggleCheckedAsOrder.length;
  }
  var to = ToggleCheckedAsOrder[toIndex];
  if (to) {
    checkAs(capture.revision, capture.capture, to);
  }
}
