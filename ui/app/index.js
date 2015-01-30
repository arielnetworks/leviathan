
var _mixins = require('./_mixins');
var React = require('react');

var BidimentionalTable = require('../components/BidimentionalTable');
var RevisionStore = require('../stores/RevisionStore');

var Index = React.createClass({

  mixins: [_mixins],

  render() {
    RevisionStore.fetchRevisions(0, 20);
    return <BidimentionalTable
              revisions={this.state.revisions}
              captures={this.state.captures} />
  }

});

module.exports = Index;
