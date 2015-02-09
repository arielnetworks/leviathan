
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
        {revision['@captures'].map((capture) =>
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
  var total = revision.total;
  var processed = (total - revision['UNPROCESSED && !OK']) / total * 100;
  var needToProcess = revision['UNPROCESSED && !OK'] / total * 100;
  return (
    <div className="progress">
      <div className={'progress-bar progress-bar-success'} style={{width: processed + '%'}}><span>{processed}% 機械OK or ユーザー処理済</span></div>
      <div className={'progress-bar progress-bar-danger'} style={{width: needToProcess + '%'}}><span>{needToProcess}% not 機械OK and ユーザー未処理</span></div>
    </div>  
  )
}
