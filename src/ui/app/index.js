
var _mixins = require('./_mixins');
var React = require('react');

var RevisionStore = require('../stores/RevisionStore');
var Navbar = require('../components/Navbar');

var Index = React.createClass({

  mixins: [_mixins],

  componentDidMount() {
    RevisionStore.fetchRevisions(0, 20);
  },

  render() {
    if (!this.state.revisions) return <span>...</span>
    var tbodyContent = this.state.revisions.map((revision, index) => {
      return <tr key={index}> <th><a href={'/#/revisions/' + revision.id}>{revision.id}</a></th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
    });
    return (
      <div className="app-index">
        <Navbar />
        <div className="container">
          <table className="table table-hover">
            <thead>
              <tr> <th>#revision</th> <th>First Name</th> <th>Last Name</th> <th>Username</th> </tr>
            </thead>
            <tbody>
              {tbodyContent}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

});

module.exports = Index;
