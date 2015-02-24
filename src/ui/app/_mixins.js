
var RevisionStore = require('../stores/RevisionStore');

module.exports = {

  componentDidMount() {
    RevisionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    RevisionStore.removeChangeListener(this._onChange);
  }

};
