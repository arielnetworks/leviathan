
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var Path = require('path');
var RevisionStore = require('../stores/RevisionStore')
var Const = require('../const');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');
var Table = require('../components/Table');
var _ = require('underscore');



var Revision = React.createClass({

  getInitialState() {
    var store = RevisionStore.get();
    return {
      revision: store.revisionsTable[this.getParams().revision]
    };
  },

  _onChange() {
    var store = RevisionStore.get();
    this.setState({
      revision: store.revisionsTable[this.getParams().revision]
    });
  },

  mixins: [_mixins, Router.State],

  render() {
    var currPage = +this.getQuery().page || 1;
    RevisionStore.syncCaptures(this.getParams().revision, currPage);
    var revision = this.state.revision;
    if (!revision || revision.total == null || !revision['@captures']) return <span>...</span>;

    var Columns = [
      {id: 'captureName', label: 'キャプチャ', formatter: capture =>
        <a href={Path.join('#/revisions/', revision.id, '/captures/', capture.capture)}>{capture.captureName}</a> },
      {id: 'done', label: [<i className="fa fa-check"></i>, '機械OKまたは人間処理済'], formatter: capture =>
        capture.status == Const.Status.OK || capture.checkedAs != Const.CheckedAs.UNPROCESSED ? <i className="fa fa-check"></i> : null },
      {id: 'checkedAs', label: '人間', formatter: capture =>
        <span className={'label label-' + Const.CheckedAsClassNameMap[capture.checkedAs]}>{capture.checkedAs}</span> },
      {id: 'status', label: '機械', formatter: capture =>
        <small className={'label label-' + Const.StatusClassNameMap[capture.status]}>{capture.status}</small> }
    ];

    return (
      <div className="app-revision">
        <Navbar />
        <div className="container">
          <ProgressBar cssModifier="large" revision={revision} />
          <h1>Revision {this.getParams().revision} の報告です！</h1>
          <Table cssModifier="captures"
                 rows={revision['@captures']}
                 total={revision.total}
                 columns={Columns}
                 currPage={currPage}
                 pageUrlBuilder={page => Path.join('#/revisions', revision.id) + '?page=' + page}/>
        </div>
      </div>
    )
  }
})
module.exports = Revision;



// function renderStatus() {
//   var revision = this.state.revisionsTable[this.getParams().revision];
//   var total = revision.total;
//   return (
//     <div className="progress">
//       {Const.ReportedAs.map((id) => {
//         var percentile = (revision.reportedAs[id] / total * 100);
//         return (
//           <div className={'progress-bar progress-bar-' + Const.StatusClassNameMap[id]} style={{width: percentile + '%'}}>
//             <span>{percentile}% {id}</span>
//           </div>
//         )
//       })}
//     </div>  
//   )
// }
