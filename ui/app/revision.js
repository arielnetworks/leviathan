
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
        <p>全体：{revision.total}, 未処理：{revision.UNPROCESSED}, OK：{revision.IS_OK}, BUG：{revision.IS_BUG}</p>
        : undefined;
    return (
      <div>
        <h1>Revision {this.props.revision} の報告です！</h1>
        {statusHTML}
      </div>
    )
  },

  getRevision() {
    return this.state.revisions[this.props.revision];
  }
})
module.exports = Revision;

