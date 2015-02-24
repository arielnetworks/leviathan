var React = require('react');
var Router = require('react-router');
var routes = require('./routes');

// var RevisionStore = require('./stores/RevisionStore');
// var e = document.getElementById('initialData');
// RevisionStore.initialize(JSON.parse(e.dataset.initialData));

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});
