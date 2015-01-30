
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')

var Revision = React.createClass({
  render() {
    return <div>yeah, {this.props.revision}</div>
  }
})
module.exports = Revision;

