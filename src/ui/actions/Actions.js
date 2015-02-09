
var Dispatcher = require('../dispatcher/Dispatcher');
var {CheckedAs, Actions} = require('../const');
var xhr = require('../xhr');

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
  }

};
