
var RevisionStore = require('../stores/RevisionStore');
var Router = require('react-router');

module.exports = {

  componentDidMount() {
    RevisionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    RevisionStore.removeChangeListener(this._onChange);
  }
  
};
