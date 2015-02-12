
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var RevisionStore = require('../stores/RevisionStore')
var Const = require('../const');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');



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
        <Navbar />
        <div className="container">
          <ProgressBar revision={revision} />
          <h1>Revision {this.getParams().revision} の報告です！</h1>
          <div className="yeah">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>キャプチャ</th>
                  <th><i className="fa fa-check"></i>機械OKまたは人間処理済</th>
                  <th>人間</th>
                  <th>機械</th>
                </tr>
              </thead>
              <tbody>
                {revision['@captures'].map(capture => {
                  console.log('xx');
                  var done = capture.status == Const.Status.OK || capture.checkedAs != Const.CheckedAs.UNPROCESSED ? <i className="fa fa-check"></i> : null;
                  return <tr>
                    <td><a href={'#/revisions/' + this.getParams().revision + '/captures/' + capture.capture}>{capture.captureName}</a></td>
                    <td>{done}</td>
                    <td>
                      <span className={'label label-' + Const.CheckedAsClassNameMap[capture.checkedAs]}>
                        {capture.checkedAs}
                      </span>
                    </td>
                    <td>
                      <small className={'label label-' + Const.StatusClassNameMap[capture.status]}>
                        {capture.status}
                      </small>
                    </td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
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
