
var RevisionStore = require('../stores/RevisionStore');
var Router = require('react-router');

module.exports = {

  getInitialState() {
    return RevisionStore.get();
  },

  _onChange() {
    this.setState(RevisionStore.get())
  },

  componentDidMount() {
    RevisionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    RevisionStore.removeChangeListener(this._onChange);
  }
  
};
