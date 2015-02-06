
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var RevisionStore = require('../stores/RevisionStore')
var Const = require('../const');



var Revision = React.createClass({

  mixins: [_mixins, Router.State],

  componentDidMount() {
    RevisionStore.fetchRevision(this.getParams().revision);
  },

  render() {
    var revision = this.state.revisionsTable[this.getParams().revision];
    if (!revision || revision.total == null) return <span>...</span>;
    return (
      <div className="app-revision">
        <ol className="breadcrumb">
          <li><a href="#/">Leviathan</a></li>
          <li className="active">{this.getParams().revision}</li>
        </ol>
        {renderStatus.call(this)}
        {renderProgress.call(this)}
        <h1>Revision {this.getParams().revision} の報告です！</h1>
        <ul>
        {revision.captures.map((capture) =>
          <li><a href={'#/revisions/' + this.getParams().revision + '/captures/' + capture.capture}>{capture.captureName}</a></li>
        )}
        </ul>
      </div>
    )
  }

})
module.exports = Revision;

function renderStatus() {
  var revision = this.state.revisionsTable[this.getParams().revision];
  var total = revision.total;
  return (
    <div className="progress">
      {Const.ReportedAs.map((id) => {
        var percentile = (revision.reportedAs[id] / total * 100);
        return (
          <div className={'progress-bar progress-bar-' + Const.StatusClassNameMap[id]} style={{width: percentile + '%'}}>
            <span>{percentile}% {id}</span>
          </div>
        )
      })}
    </div>  
  )
}

function renderProgress() {
  var revision = this.state.revisionsTable[this.getParams().revision];
  // UNPROCESSED && (SUSPICIOUS || ERROR)
  var items = [];

  // OTHERWISE
  return (
    <div className="progress">
    </div>  
  )
}
