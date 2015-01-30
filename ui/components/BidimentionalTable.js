
var React = require('react');
var RevisionStore = require('../stores/RevisionStore');

var BidimentionalTable = React.createClass({

  getInitialState: function() {
    return RevisionStore.get();
  },

  _onChange() {
    this.setState(RevisionStore.get())
  },

  componentDidMount: function() {
    RevisionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    RevisionStore.removeChangeListener(this._onChange);
  },

  render () {

    RevisionStore.fetchRevisions(0, 20);
    var tbodyContent = this.state.revisions.map((revision) => {
      return <tr> <th><a href={'/revisions/' + revision.id}>{revision.id}</a></th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
    });
    return (
      <table className="table table-hover">
        <thead>
          <tr> <th>#revision</th> <th>First Name</th> <th>Last Name</th> <th>Username</th> </tr>
        </thead>
        <tbody>
          {tbodyContent}
        </tbody>
      </table>
    )
  } 
});

module.exports = BidimentionalTable;
