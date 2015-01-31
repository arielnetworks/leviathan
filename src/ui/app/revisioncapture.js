
var _mixins = require('./_mixins');
var _ = require('underscore');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')

var Revision = React.createClass({

  mixins: [_mixins],

  render() {
    RevisionStore.fetchCapture(this.props.revision, this.props.capture);
    console.log('x');
    return (
      <div>
        <h1>Revision {this.props.revision}、{this.state.currentCapture && this.state.currentCapture.captureName} の報告です！</h1>
        <table className="table table-hover">
          <tbody>
            {this.state.currentCapture && _.map(this.state.currentCapture, (v, k) =>
              <tr>
                <th>{k}</th>
                <td>{v}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  },

  getRevision() {
    return this.state.revisions[this.props.revision];
  }
})
module.exports = Revision;


