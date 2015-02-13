
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var Path = require('path');
var RevisionStore = require('../stores/RevisionStore')
var Const = require('../const');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');
var _ = require('underscore');



var Columns = [
  {id: 'captureName', label: 'キャプチャ', formatter: function (capture) {
    return <a href={'#/revisions/' + this.getParams().revision + '/captures/' + capture.capture}>{capture.captureName}</a> } },
  {id: 'done', label: [<i className="fa fa-check"></i>, '機械OKまたは人間処理済'], formatter: function (capture) {
    return capture.status == Const.Status.OK || capture.checkedAs != Const.CheckedAs.UNPROCESSED ? <i className="fa fa-check"></i> : null } },
  {id: 'checkedAs', label: '人間', formatter: function (capture) {
    return <span className={'label label-' + Const.CheckedAsClassNameMap[capture.checkedAs]}>{capture.checkedAs}</span> } },
  {id: 'status', label: '機械', formatter: function (capture) {
      return <small className={'label label-' + Const.StatusClassNameMap[capture.status]}>{capture.status}</small> } }
];

var Revision = React.createClass({

  mixins: [_mixins, Router.State],

  render() {
    var currPage = +this.getQuery().page || 1;
    RevisionStore.syncRevision(this.getParams().revision, currPage);
    var revision = this.state.revisionsTable[this.getParams().revision];
    if (!revision || revision.total == null) return <span>...</span>;
    // TODO: "tr" has to have "key"
    return (
      <div className="app-revision">
        <Navbar />
        <div className="container">
          <ProgressBar revision={revision} />
          <h1>Revision {this.getParams().revision} の報告です！</h1>
          <div className="paged-table paged-table--captures">
            <table className="table table-hover">
              <thead>
                <tr>
                  {_.map(Columns, column => <th className={column.id} key={column.id}>{column.label}</th>)}
                </tr>
              </thead>
            </table>
            <div className="paged-table__canvas">
              <table className="table table-hover">
                <tbody>
                  {revision['@captures'].map(capture =>
                    <tr>
                      {_.map(Columns, column =>
                        <th className={column.id} key={column.id}>{column.formatter.call(this, capture)}</th>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {this.renderPagination(revision, currPage)}
          </div>
        </div>
      </div>
    )
  },

  renderPagination(revision, currPage) {
    var perPage = 20; // TODO: Const
    var total = revision.total;
    if (total <= perPage) return;
    var maxPage = Math.ceil(total / perPage);
    var isLeftEdge = currPage == 1;
    var isRightEdge = currPage == maxPage;
    var margin = 5;
    var rangeStart = Math.max(1, currPage - margin);
    var rangeEnd = Math.min(currPage + margin, maxPage);
    var lines = [];
    lines.push(
      <li key="first" className={isLeftEdge ? 'disabled' : null}>
        <a href={Path.join('#/revisions', revision.id) + '?page=' + 1}><span>&laquo;</span></a>
      </li>
    );
    if (1 < rangeStart) {
      lines.push(
        <li key="leftskip">
          <a href={Path.join('#/revisions', revision.id) + '?page=' + (rangeStart - 1)}><span>...</span></a>
        </li>
      );
    }
    _.each(_.range(rangeStart, rangeEnd + 1), page => {
      lines.push(
        <li key={page} className={currPage == page ? 'active' : null}>
          <a href={Path.join('#/revisions', revision.id) + '?page=' + page}>{page}</a>
        </li>
      )
    })
    if (rangeEnd < maxPage) {
      lines.push(
        <li key="rightskip">
          <a href={Path.join('#/revisions', revision.id) + '?page=' + (rangeEnd + 1)}><span>...</span></a>
        </li>
      )
    }
    lines.push(
      <li key="last" className={isRightEdge ? 'disabled' : null}>
        <a href={Path.join('#/revisions', revision.id) + '?page=' + maxPage}><span>&raquo;</span></a>
      </li>
    )
    return (
      <nav className="text-center">
        <ul className="pagination">{lines}</ul>
      </nav>
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
