
var _mixins = require('./_mixins');
var React = require('react');
var RevisionStore = require('../stores/RevisionStore')

var Revision = React.createClass({

  mixins: [_mixins],

  render() {
    RevisionStore.fetchCaptures(this.props.revision);
    var revision = this.getRevision();
    var statusHTML = revision ?
        <p>全体：{revision.total}, 未処理：{revision.UNPROCESSED}, OK：{revision.IS_OK}, BUG：{revision.IS_BUG}</p> : undefined;
    var capturesHTML;
    if (this.state.captures) {
      capturesHTML = (
        <ul>
        {this.state.captures.map((capture) =>
          <li><a href={'/revisions/' + this.props.revision + '/captures/' + capture.capture}>{capture.capture}</a></li>
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

