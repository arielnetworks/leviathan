
var React = require('react');
var {State, Link} = require('react-router');
var Table = require('../components/Table');
var ProgressBar = require('../components/ProgressBar');

var Navbar = require('../components/Navbar');

var Index = React.createClass({

  componentDidMount() {
    this.props.store.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    this.props.store.removeChangeListener(this._onChange);
  },

  getInitialState() {
    var store = this.props.store.getStore();
    return {
      revisions: store.revisions,
      revisionsTotal: store.revisionsTotal
    };
  },

  _onChange() {
    var store = this.props.store.getStore();
    this.setState({
      revisions: store.revisions,
      revisionsTotal: store.revisionsTotal
    });
  },

  mixins: [State],

  render() {
    var currPage = +this.getQuery().page || 1;
    this.props.store.syncRevisions(currPage);
    if (!this.state.revisions) return <span>...</span>;

    var Columns = [
      {id: 'revision', label: '#', formatter: revision =>
        <Link to="/revisions/:id" params={{id: revision.id}}>{revision.id}</Link> },
      {id: 'reported-as', label: '機械検知', formatter: revision => {
        var className = 'label ' + (
          revision.reportedAs.ERROR || revision.reportedAs.SUSPICIOUS ? 'label-warning' :
          'label-success');
        var toolTip = revision.reportedAs.ERROR || revision.reportedAs.SUSPICIOUS ?
            'SUSPICIOUS: ' + revision.reportedAs.SUSPICIOUS + '件、ERROR: ' + revision.reportedAs.ERROR + '件' :
            '';
        var content = revision.reportedAs.SUSPICIOUS + revision.reportedAs.ERROR;
        return <span className={className} title={toolTip}>{content}</span>; }},
      {id: 'is-bug', label: 'バグ判定', formatter: revision =>
        revision.checkedAs.IS_BUG ?
          <span className="label label-danger">{revision.checkedAs.IS_BUG}</span> : '' },
      {id: 'progress-col', label: 'チェック進み具合', formatter: revision =>
        <ProgressBar revision={revision} /> }
    ];

    return (
      <div className="app-index">
        <Navbar />
        <div className="container">
          <Table cssModifier="revisions"
                 rows={this.state.revisions}
                 total={this.state.revisionsTotal}
                 columns={Columns}
                 currPage={currPage}
                 urlBase="/" />
        </div>
      </div>
    );
  }

});

module.exports = Index;
