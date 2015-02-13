
var _mixins = require('./_mixins');
var React = require('react');
var Router = require('react-router');
var Table = require('../components/Table');
var Path = require('path');

var RevisionStore = require('../stores/RevisionStore');
var Navbar = require('../components/Navbar');

var Index = React.createClass({

  mixins: [_mixins, Router.State],

  render() {
    var currPage = +this.getQuery().page || 1;
    RevisionStore.syncRevisions(1);
    if (!this.state.revisions) return <span>...</span>

    var tbodyContent = this.state.revisions.map((revision, index) => {
      return <tr key={index}> <th><a href={'/#/revisions/' + revision.id}>{revision.id}</a></th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
    });

    var Columns = [
      {id: 'revision', label: '#', formatter: function (revision) {
        return <a href={Path.join('#/revisions/', revision.id)}>{revision.id}</a> } }
    ];

    return (
      <div className="app-index">
        <Navbar />
        <div className="container">
          <Table rows={this.state.revisions}
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
