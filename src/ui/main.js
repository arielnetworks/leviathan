var React = require('react');
var Router = require('react-router');
var routes = require('./routes');
var RevisionStore = require('./stores/RevisionStore');

var store = RevisionStore.create();
var el = document.getElementById('initialData');
if (el) {
  try {
    store.initStore(JSON.parse(el.dataset.initialData));
  } catch(e) {}
}

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler store={store} />, document.body);
});
