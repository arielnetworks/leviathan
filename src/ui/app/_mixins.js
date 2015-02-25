
var RevisionStore = require('../stores/RevisionStore');

module.exports = {

  componentDidMount() {
    this.props.store.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    this.props.store.removeChangeListener(this._onChange);
  }

};
