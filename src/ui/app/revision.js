
var _mixins = require('./_mixins');
var React = require('react');
var {State, Link} = require('react-router');
var Path = require('path');
var Const = require('../../const');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');
var Table = require('../components/Table');
var Actions = require('../actions/Actions');



var Revision = React.createClass({

  getInitialState() {
    return this._getState();
  },

  _onChange() {
    this.setState(this._getState());
  },

  _getState() {
    return {
      revision: this.props.store.getStore().revisionsTable[this.getParams().revision]
    };
  },

  mixins: [_mixins, State],

  render() {

    var currPage = +this.getQuery().page || 1;
    this.props.store.syncCaptures(this.getParams().revision, currPage);
    var revision = this.state.revision;
    if (!revision || revision.total === null || !revision['@captures']) return <span>...</span>;

    var Columns = [
      {id: 'captureName', label: 'キャプチャ', onClick: sort.bind(null, 'captureName'), formatter: capture =>
        <Link to="/revisions/:revision/captures/:capture" params={{revision: revision.id, capture: capture.capture}}>{capture.captureName}</Link> },
      {id: 'done', label: [<i className="fa fa-check"></i>, '機械OKまたは人間処理済'], onClick: sort.bind(null, '???'), formatter: capture =>
        capture.status === Const.Status.OK || capture.checkedAs !== Const.CheckedAs.UNPROCESSED ? <i className="fa fa-check"></i> : null },
      {id: 'checkedAs', label: '人間', onClick: sort.bind(null, 'checkedAs'), formatter: capture =>
        <button onClick={Actions.toggleCheckedAs.bind(null, capture, 1)} className={'btn btn-xs btn-' + Const.CheckedAsClassNameMap[capture.checkedAs]}>{capture.checkedAs}</button> },
      {id: 'status', label: '機械', onClick: sort.bind(null, 'status'), formatter: capture =>
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
                 urlBase={Path.join('/revisions', revision.id)}/>
        </div>
      </div>
    );
  }
});
module.exports = Revision;



function sort(names) {
  Actions.sort(names);
}
