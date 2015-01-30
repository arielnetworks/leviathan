
var React = require('react');
var RevisionStore = require('../stores/RevisionStore');

var BidimentionalTable = React.createClass({

  getInitialState: function() {
    return RevisionStore.get();
  },

  _onChange() {
    console.log('_onChange');
  },

  componentDidMount: function() {
    RevisionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    RevisionStore.removeChangeListener(this._onChange);
  },

  render () {

    RevisionStore.fetchRevisions(0, 20);
    return (
      <table className="table table-hover">
        <thead>
          <tr> <th>#</th> <th>First Name</th> <th>Last Name</th> <th>Username</th> </tr>
        </thead>
        <tbody>
          <tr> <th scope="row">7</th> <td>Mark</td> <td>Otto</td> <td>@mdo</td> </tr>
          <tr> <th scope="row">2</th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
          <tr> <th scope="row">3</th> <td>Larry</td> <td>the Bird</td> <td>@twitter</td> </tr>
          <tr> <th scope="row">2</th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
          <tr> <th scope="row">3</th> <td>Larry</td> <td>the Bird</td> <td>@twitter</td> </tr>
          <tr> <th scope="row">2</th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
          <tr> <th scope="row">3</th> <td>Larry</td> <td>the Bird</td> <td>@twitter</td> </tr>
          <tr> <th scope="row">2</th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
          <tr> <th scope="row">3</th> <td>Larry</td> <td>the Bird</td> <td>@twitter</td> </tr>
        </tbody>
      </table>
    )
  } 
});

module.exports = BidimentionalTable;
