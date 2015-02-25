
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var Path = require('path');
var RevisionStore = require('../stores/RevisionStore');
var Const = require('../const');
var ProgressBar = require('../components/ProgressBar');
var Navbar = require('../components/Navbar');
var Table = require('../components/Table');
var Actions = require('../actions/Actions');
var QueryString = require('querystring');

var SORT_VALUE_DELIM = ' ';

var Revision = React.createClass({

  getInitialState() {
    var store = RevisionStore.getStore();
    return {
      revision: store.revisionsTable[this.getParams().revision]
    };
  },

  _onChange() {
    var store = RevisionStore.getStore();
    this.setState({
      revision: store.revisionsTable[this.getParams().revision]
    });
  },

  mixins: [_mixins, Router.State],

  pageUrlBuilder (revision, page, order) {
    var params = {page: page};
    if (order) {
      var direction = (order[1] || 'DESC') === 'DESC' ? 'ASC' : 'DESC';
      params.order = `${order[0]}${SORT_VALUE_DELIM}${direction}`;
    }
    return Path.join('#/revisions', revision.id) + '?' + QueryString.stringify(params);
  },

  // XXX: decoding sort specification is also in ../../persist/index#parseOrderParam_.
  //      Use the same logic in server & ui side
  setSortToColumn (columns, order) {
    if (order) {
      var parsed = order.split(SORT_VALUE_DELIM);
      columns.forEach((column) => {
        if (column.id === parsed[0]) {
          column.sort = parsed[1];
        }
      });
    }
  },

  render() {
    var query = this.getQuery(),
        currPage = +query.page || 1,
        order = query.order;
    RevisionStore.syncCaptures(this.getParams().revision, currPage, order);
    var revision = this.state.revision;
    if (!revision || revision.total === null || !revision['@captures']) return <span>...</span>;

    var Columns = [
      {id: 'captureName', label: 'キャプチャ', formatter: capture =>
        <a href={Path.join('#/revisions/', revision.id, '/captures/', capture.capture)}>{capture.captureName}</a> },
      {id: 'done', label: [<i className="fa fa-check"></i>, '機械OKまたは人間処理済'], formatter: capture =>
        capture.status === Const.Status.OK || capture.checkedAs !== Const.CheckedAs.UNPROCESSED ? <i className="fa fa-check"></i> : null },
      {id: 'checkedAs', label: '人間', formatter: capture =>
        <button onClick={Actions.toggleCheckedAs.bind(null, capture, 1)} className={'btn btn-xs btn-' + Const.CheckedAsClassNameMap[capture.checkedAs]}>{capture.checkedAs}</button> },
      {id: 'status', label: '機械', formatter: capture =>
        <small className={'label label-' + Const.StatusClassNameMap[capture.status]}>{capture.status}</small> }
    ];
    this.setSortToColumn(Columns, order);

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
                 pageUrlBuilder={this.pageUrlBuilder.bind(null, revision)}/>
        </div>
      </div>
    );
  }
});
module.exports = Revision;
