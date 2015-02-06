
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var RevisionStore = require('../stores/RevisionStore')

var Revision = React.createClass({

  mixins: [_mixins, Router.State],

  componentDidMount() {
    RevisionStore.fetchRevision(this.getParams().revision);
  },

  render() {
    var revision = this.state.revisionsTable[this.getParams().revision];
    var statusHTML = revision ?
        <p>全体：{revision.total}, 未処理：{revision.UNPROCESSED}, OK：{revision.IS_OK}, BUG：{revision.IS_BUG}</p> : undefined;
    var capturesHTML;
    if (revision.captures) {
      capturesHTML = (
        <ul>
        {revision.captures.map((capture) =>
          <li><a href={'#/revisions/' + this.getParams().revision + '/captures/' + capture.capture}>{capture.captureName}</a></li>
        )}
        </ul>
      );
    }
    return (
      <div className="app-revision">
        <ol className="breadcrumb">
          <li><a href="#/">Leviathan</a></li>
          <li className="active">{this.getParams().revision}</li>
        </ol>
        <h1>Revision {this.getParams().revision} の報告です！</h1>
        {statusHTML}
        {capturesHTML}
      </div>
    )
  }

})
module.exports = Revision;

