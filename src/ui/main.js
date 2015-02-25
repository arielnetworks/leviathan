var React = require('react');
var Router = require('react-router');
var routes = require('./routes');
var RevisionStore = require('./stores/RevisionStore');

Router.run(routes, Router.HistoryLocation, function (Handler) {
  var store = RevisionStore.create();
  var el = document.getElementById('initialData');
  if (el) {
    try {
      store.initialize(JSON.parse(el.dataset.initialData));
    } catch(e) {}
  }
  React.render(<Handler store={store} />, document.body);
});
