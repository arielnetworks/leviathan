
var Dispatcher = require('../dispatcher/Dispatcher');
var {CheckedAs, Actions} = require('../const');
var xhr = require('../xhr');
var _ = require('underscore');

module.exports = {

  /**
   * @param {string} capture
   * @param {CheckedAs} as
   */
  checkAs(revision, capture, as) {
    Dispatcher.dispatch({
      type: Actions.CHECKAS,
      revision, capture, as
    });
  },

  sort(names) {
    if (!_.isArray(names)) names = [names];
    console.log(names);
  }

};
