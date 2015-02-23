
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var Table = require('../components/Table');
var Path = require('path');
var ProgressBar = require('../components/ProgressBar');

var RevisionStore = require('../stores/RevisionStore');
var Navbar = require('../components/Navbar');

var Index = React.createClass({

  getInitialState() {
    var store = RevisionStore.get();
    return {
      revisions: store.revisions,
      revisionsTotal: store.revisionsTotal
    };
  },

  _onChange() {
    var store = RevisionStore.get();
    this.setState({
      revisions: store.revisions,
      revisionsTotal: store.revisionsTotal
    });
  },

  mixins: [_mixins, Router.State],

  render() {
    var currPage = +this.getQuery().page || 1;
    RevisionStore.syncRevisions(currPage);
    if (!this.state.revisions) return <span>...</span>

    var tbodyContent = this.state.revisions.map((revision, index) => {
      return <tr key={index}> <th><a href={'/#/revisions/' + revision.id}>{revision.id}</a></th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
    });

    var Columns = [
      {id: 'revision', label: '#', formatter: revision =>
        <a href={Path.join('#/revisions/', revision.id)}>{revision.id}</a> },
      {id: 'machine', label: '機械検知', formatter: revision => {
        var className = 'label ' + (
          revision.reportedAs.ERROR ? 'label-danger' :
          revision.reportedAs.SUSPICIOUS ? 'label-warning' :
          'label-success');
        var toolTip = revision.reportedAs.ERROR || revision.reportedAs.SUSPICIOUS ?
            'SUSPICIOUS: ' + revision.reportedAs.SUSPICIOUS + '件、ERROR: ' + revision.reportedAs.ERROR + '件' :
            '';
        var content = revision.reportedAs.SUSPICIOUS + revision.reportedAs.ERROR;
        return <span className={className} title={toolTip}>{content}</span> }},
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
                 pageUrlBuilder={page => '#/?page=' + page}/>
        </div>
      </div>
    )
  }

});

module.exports = Index;
