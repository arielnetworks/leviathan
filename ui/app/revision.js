
var _mixins = require('./_mixins');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')

var Revision = React.createClass({

  mixins: [_mixins],

  render() {
    RevisionStore.fetchSingle(this.props.revision);
    RevisionStore.fetchCaptures(this.props.revision);
    var revision = this.getRevision();
    var statusHTML = revision ?
        <p>全体：{revision.total}, 未処理：{revision.UNPROCESSED}, OK：{revision.IS_OK}, BUG：{revision.IS_BUG}</p> : undefined;
    var capturesHTML;
    if (revision && revision.captureIds) {
      capturesHTML = (
        <ul>
        {revision.captureIds.map((id) =>
          <li><a href={'/revisions/' + this.props.revision + '/captures/' + id}>{id}</a></li>
        )}
        </ul>
      );
    }
    return (
      <div>
        <h1>Revision {this.props.revision} の報告です！</h1>
        {statusHTML}
        {capturesHTML}
      </div>
    )
  },

  getRevision() {
    return this.state.revisions[this.props.revision];
  }
})
module.exports = Revision;

