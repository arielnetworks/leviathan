
var React = require('react');

var BidimentionalTable = React.createClass({

  render() {
    var tbodyContent = this.props.revisions.map((revision) => {
      return <tr> <th><a href={'/#/revisions/' + revision.id}>{revision.id}</a></th> <td>Jacob</td> <td>Thornton</td> <td>@fat</td> </tr>
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
